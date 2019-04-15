///////////////////Budget controller//////////////////////
//////////////////////////////////////////////////////////
var budgetController = (function() {
    
    //this is function constructor for creating new objects
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    //this is function constructor for creating new objects
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description; 
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        })
        data.totals[type] = sum;
    }
    
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
    }
    
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

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpensee: data.totals.exp,
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
        percentageLabel: '.budget__expenses--percentage'
    }
    
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
                 html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                  element = DOMstrings.expensesContainer;
                  html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExpensee;
           

            if( obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
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
    }
    
    var updateBudget = function() {

            // 1. Calculate the budget
            budgetController.calculateBudget();

            // 2. Return the budget
            var budget = budgetController.getBudget();


            // 3. Display the budget on the UI
            UIController.displayBudget(budget);
    }

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
            }

           
    }
                   
    return {
        init: function() {
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpensee: 0,
                percentage: -1
            });
            setupEventListeners(); //We setup event listeners with this call
        }
    }
    
})(budgetController, UIController);

controller.init(); //this is only line of code we will put outside the module functions, we need
// this call because of the event listeners, without this call, event listeners would not work
