var ViewModel = function() {
    var self = this;
    this.filter = ko.observable('');

    this.filteredList = ko.computed(function () {
        var result = [];
        locations.forEach(function (location) {
            if(self.filter() === null){
                result.push(location)
            }
            else if(location.title.toLowerCase().startsWith(self.filter().toLowerCase())){
                result.push(location)
            }
        });
        return result;
    })
};

ko.applyBindings(new ViewModel());