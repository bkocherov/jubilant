/**
*  Copyright 2017 Roland.Bouman@gmail.com; Just-BI.nl
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*
*/
sap.ui.define([
  "jubilant/components/visualisation/BaseVisualisationEditorComponentManager",
  "sap/ui/model/Sorter",
  "sap/ui/table/Row"
], 
function(
   BaseVisualisationEditorComponentManager,
   Sorter,
   Row
){
  var VisualisationSortAreaManager = BaseVisualisationEditorComponentManager.extend("jubilant.components.visualisation.VisualisationSortAreaManager", {
    constructor: function(visualisationController){
      BaseVisualisationEditorComponentManager.prototype.constructor.apply(this, arguments);
    },
    _getNewSortColumnData: function(){
      return {
        field: null,
        "descending": false
      };
    },
    _initModels: function(){
      BaseVisualisationEditorComponentManager.prototype._initModels.apply(this, arguments);
      var visualisationStateModel = this._getVisualisationStateModel();
      var path = this._getVisualisationStateModelPath() + "/items";
      visualisationStateModel.setProperty(path, [this._getNewSortColumnData()]);
    },
    _getSortModelRowForEvent: function(event){
      var control = event.getSource();
      var row;
      do {
        control = control.getParent();
      } while (control && !(control instanceof Row));
      return control;
    },
    _getSortRowBindingContext: function(row){
      var controller = this._visualisationController;
      var visualisationStateModelName = controller._getVisualisationStateModelName();
      return row.getBindingContext(visualisationStateModelName);
    },
    _handleSortDirectionButtonPressed: function(row) {
      var rowContext = this._getSortRowBindingContext(row);
      var visualisationStateModel = this._getVisualisationStateModel();
      visualisationStateModel.setProperty(rowContext.getPath() + "/descending", !rowContext.getObject().descending);
    },
    handleSortDirectionButtonPressed: function(event) {
      var row = this._getSortModelRowForEvent(event);
      this._handleSortDirectionButtonPressed(row);
    },
    _getSortColumnsPath: function(){
      var path = this._getVisualisationStateModelPath() + "/items";
      return path;
    },
    _getSortColumns: function(){
      var controller = this._visualisationController;
      var visualisationStateModel = controller._getVisualisationStateModel();
      var path = this._getSortColumnsPath();
      var sortColumns = visualisationStateModel.getProperty(path);
      return sortColumns;
    },
    _setSortColumns: function(sortColumns){
      var visualisationStateModel = this._getVisualisationStateModel();
      var path = this._getVisualisationStateModelPath() + "/items";
      visualisationStateModel.setProperty(path, sortColumns);
    },
    _moveSortColumn: function(row, positions){
      var rowContext = this._getSortRowBindingContext(row);
      var path = rowContext.getPath();
      var index = parseInt(path.split("/").pop(), 10);
      if (index === 0 && positions < 0) {
        //can't move further up
        return;
      }
      var controller = this._visualisationController;
      var sortColumns = this._getSortColumns();
      if (index === sortColumns.length - 1 && positions > 0) {
        //can't move further down
        return;
      }
      var object = sortColumns[index];
      sortColumns.splice(index, 1);
      sortColumns.splice(index + positions, 0, object);
      this._setSortColumns(sortColumns)
    },
    _handleSortColumnUpButtonPressed: function(row) {
      this._moveSortColumn(row, -1);
    },
    handleSortColumnUpButtonPressed: function(event) {
      var row = this._getSortModelRowForEvent(event);
      this._handleSortColumnUpButtonPressed(row);
    },
    _handleSortColumnDownButtonPressed: function(row) {
      this._moveSortColumn(row, 1);
    },
    handleSortColumnDownButtonPressed: function(event) {
      var row = this._getSortModelRowForEvent(event);
      this._handleSortColumnDownButtonPressed(row);
    },
    _handleAddSortColumnButtonPressed: function(row){
      var rowContext = this._getSortRowBindingContext(row);
      var path = rowContext.getPath().split("/");
      var index = parseInt(path.pop(), 10) + 1;
      var path = this._getVisualisationStateModelPath() + "/items";
      var sortColumns = this._getSortColumns();
      sortColumns.splice(index, 0, this._getNewSortColumnData());
      this._setSortColumns(sortColumns)
    },
    handleAddSortColumnButtonPressed: function(event){
      var row = this._getSortModelRowForEvent(event);
      this._handleAddSortColumnButtonPressed(row);
    },
    _handleRemoveSortColumnButtonPressed: function(row){
      var rowContext = this._getSortRowBindingContext(row);
      var path = rowContext.getPath().split("/");
      var index = parseInt(path.pop(), 10);
      var sortColumns = this._getSortColumns();
      if (sortColumns.length > 1) {
        sortColumns.splice(index, 1);
      }
      else {
        delete sortColumns[0].field;
      }
      this._setSortColumns(sortColumns);
      visualisationStateModel.setProperty(path, sortColumns);
    },
    handleRemoveSortColumnButtonPressed: function(event){
      var row = this._getSortModelRowForEvent(event);
      this._handleRemoveSortColumnButtonPressed(row);
    },
    getSorters: function(fieldUsageRegistry){
      var sortColumns = this._getSortColumns();
      if (!sortColumns || !sortColumns.length) {
        return null;
      }
      var sorters = [];
      var controller = this._visualisationController;
      sortColumns.forEach(function(sortColumn){
        var field = sortColumn.field; 
        if (!field) {
          return;
        }
        controller.registerFieldUsage(fieldUsageRegistry, field, this);
        var sorter = new Sorter(field, sortColumn.descending);
        sorters.push(sorter);
      }.bind(this));
      
      if (!sorters.length) {
        sorters = null;
      }
      return sorters;
    },
    _clearSorting: function(){
      this._initSortModelData();
    },
    handleClearAllSortColumns: function(event){
      this._clearSorting();
    }
  });
  return VisualisationSortAreaManager;
});