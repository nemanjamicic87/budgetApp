///////////////////Budget controller//////////////////////
//////////////////////////////////////////////////////////
var budgetController = (function() {
    
    //this is function constructor for creating new objects
    var Expense = function(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome ) * 100);
        } else{
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    //this is function constructor for creating new objects
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description; 
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        })
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // if there is no income percentage would not be 0 , and that is why we use "-1"
    };
    
    return {
        addItem: function(type, des, val){
        
            var newItem, ID;
            //[1 2 3 4 5] next ID = 6
            //[1 2 4 6 8] next ID = 9
            // ID = last ID + 1
            
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID= data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //Push it into our data structure
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {

            // id = 3
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3

            var ids = data.allItems[type].map(function(current) {
                return current.id;
            }); 

            index = ids.indexOf(id);

            // delete the item of the index id 
            // if there is no item with index id return would be -1
            if(index !== -1) {
                data.allItems[type].splice(index, 1);  // splice takes two arguments index position and number of                                        // elements to delete after that position
            }

        },

        calculateBudget: function() {
            
            // 1. calculate total income and total expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. calculate percentage of income that is expence
            if (data.totals.inc > 0 ) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            /*
            expence1 = 20
            expence2 = 10
            expence3 = 40
            total income = 100
            percentage expense1 = 20/100 = 20%
            percentage expense2 = 10/100 = 10%
            percentage expense3 = 40/100 = 40%
            */ 
            data.allItems.exp.forEach(function(current){
                current.calculatePercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            };
        },

        //just to test our data structure
        testing: function() {console.log(data);}
    };
    
})();



/////////////////////////UI controller////////////////
/////////////////////////////////////////////////////
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type) {

        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        */

        num = Math.abs(num);  // This is a metod of num
        num = num.toFixed(2); // This is a metod of Number object

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach =function(list, callback){
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        
        getInput: function(){   
            return {
               type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp   
               description: document.querySelector(DOMstrings.inputDescription).value,
               value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };    
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if(type === 'inc') {
                 element = DOMstrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                  element = DOMstrings.expensesContainer;
                  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
         },

         deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
         },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'exp');
           

            if( obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){

                if( percentages[index] > 0 ) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            }) ;



        },

        displayMonth: function() {
            var now, month, months, year;

            var now = new Date();

            months = ['Januaty', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();

            var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
    }
    
    };
})();



//////////////////////////Global app controller///////////////////////
//////////////////////////////////////////////////////////////////////
var controller = (function(budgetCtrl, UICtrl) {
    
    //function which will have all event listeners
    var setupEventListeners = function() {
        
            var DOM = UICtrl.getDOMstrings();

            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

            document.addEventListener('keypress', function(e) {
               if(e.keyCode === 13 || e.which === 13){
                   ctrlAddItem();
               }
            });

            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

            document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);

    }
    
    var updateBudget = function() {

            // 1. Calculate the budget
            budgetController.calculateBudget();

            // 2. Return the budget
            var budget = budgetController.getBudget();


            // 3. Display the budget on the UI
            UIController.displayBudget(budget);
    }

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetController.calculatePercentages();

        // 2. Read them from budget controller
        var percentages = budgetController.getPercentages();
        // 3. Update the UI with new percentages
        UIController.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
            var input, newItem;
        
            // 1. Get the field input data
            input = UICtrl.getInput();

            if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
                 
                // 2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                // 3. Add the item to the UI
                UICtrl.addListItem(newItem, input.type);
                
                // 4. Clear the fields
                UICtrl.clearFields();

                // 5. Calculate and update budget
                updateBudget();

                // 6. Calculate and update the percentages
                updatePercentages();
            }

           
    };

    var ctrlDeleteItem = function(event) {  //we need event to know which one to delete
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if( itemID ) {

                //inc-id this how id looks like, we need to split the type and id
                splitID = itemID.split('-');  // example:  ["inc","5"]

                type = splitID[0];
                ID = parseInt(splitID[1]);

                // 1. Delete item from the data structure
                budgetController.deleteItem(type, ID);
                
                // 2. Delete the item from the UI
                UIController.deleteListItem(itemID);

                // 3. Update and show the new budget
                updateBudget();

                // 4. Calculate and update the percentages
                updatePercentages();

        }

    };
                   
    return {
        init: function() {
            UICtrl.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners(); //We setup event listeners with this call
        }
    }
    
})(budgetController, UIController);

controller.init(); //this is only line of code we will put outside the module functions, we need
// this call because of the event listeners, without this call, event listeners would not work
