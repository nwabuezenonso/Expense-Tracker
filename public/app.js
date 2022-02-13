var budgetController = (function(){
  var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage  = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value/totalIncome)*100);
    }else{
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function(){
    return this.percentage
  }

  var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value
  }

  var data = {
    allItems : {
      exp : [],
      inc : []
    },
    totals :{
      exp: 0,
      inc : 0,
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal  = function(type){
    var sum = 0;

    data.allItems[type].forEach(function(cur){
      sum  += cur.value;
    });
    data.totals[type] = sum;
  }

  return {
    addItem : function(type,des,val){
      var newItem,ID

      //creating new ID
      if(data.allItems[type].length > 0 ){ 
        ID = data.allItems[type][data.allItems[type].length - 1].id +1;
      }else{
        ID = 0;
      }

      // create new item based on inc or exp
      if(type === 'exp'){
        newItem = new Expense(ID,des,val);
      }else if(type === 'inc'){
        newItem = new Income(ID,des,val);
      }
      //push it into our data Structure
      data.allItems[type].push(newItem);

      //return the new data Structure
      return newItem;

    },
    deleteItem : function(type,id){
      var ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id)

      if(index !== -1){
        data.allItems[type].splice(index,1)
      }
    },
    calculateBudget  : function(){
      //1. calculate the total income and expense
      calculateTotal('exp');
      calculateTotal('inc');

      //2. calculate the budget : income - expense
      data.budget =  data.totals.inc - data.totals.exp

      //3. Calculate the percentage that we spent
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp/data.totals.inc)*100)
      }else{
        data.percentage = -1
      }
      
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc)
      });

    },

    getPercentages : function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage()
      });
      return allPerc
    },

    getBudget : function(){
      return{
        budget : data.budget,
        totalInc : data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing : function(){
      console.log(data)
    }
  };
})();

//UICONTROLLER
var UIController  = (function(){

  var DomStrings = {
    inputType : '.add__type',
    inputDescription : '.add__description',
    inputValue : '.add__value',
    inputBtn : '.add__btn',
    incomeContainer : '.income__list',
    expenseContainer : '.expenses__list',
    budgetLabel : '.budget__value',
    incomeLabel : '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel : '.budget__expenses--percentage',
    container : '.container',
    expensesPercLabel : '.item__percentage',
    datelabel : '.date__list'
  }

  var formatNumber = function(num,type){
    var numSplit,int,dec
    num = Math.abs(num);

    num = num.toFixed(2)
    numSplit = num.split('.')

    int = numSplit[0];
    if(int.length > 3){
     int = int.substr(0,int.length - 3)+ ',' + int.substr(int.length-3,3);

    }

    dec = numSplit[1];
     return (type === 'exp' ? '-' :'+') + ' ' + int +'.' + dec
  }

  var formatbudget = function(num,type){
    var Split,integer,decimal
    num = Math.abs(num);

    num = num.toFixed(2)
    Split = num.split('.')

    integer = Split[0];
    if(integer.length > 3){
     integer = integer.substr(0,integer.length - 3)+ ',' + integer.substr(integer.length-3,3);

    }

    decimal = Split[1];
     return  integer +'.' + decimal
  }


  var nodeListForEach = function(list,callback){
    for(i = 0 ;  i <list.length ;i++ ){
      callback(list[i],i)
    }
  }

  return {
    getInput: function(){
      return{
        type : document.querySelector(DomStrings.inputType).value,
        description : document.querySelector(DomStrings.inputDescription).value,
        value : parseFloat(document.querySelector(DomStrings.inputValue).value)
      }
    },

    addListItems: function(obj,type){
      var html,newHtml,element,now, year,todayDate,month,months

      now = new Date();
      todayDate = now.getDate()
      year  = now.getFullYear();

      months = ['january','february','March','April','may','June','July','August','September','October','November','December']

      month = now.getMonth();



      if(type == 'inc'){
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="data"><div class="item__value">%value%</div><div class="date">%date%</div><div class="item__delete"><button class="item__delete--btn"> <i class="fa fa-close"> </i></button></div></div></div></div>';
        element = DomStrings.incomeContainer
      }else if(type == 'exp'){
        html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="data"><div class="item__value">%value%</div><div class="date">%date%</div><div class="item__delete"><button class="item__delete--btn"> <i class="fa fa-close"> </i></button></div></div></div></div>';
        element = DomStrings.expenseContainer
      }

      newHtml = html.replace('%id%',obj.id)
      newHtml = newHtml.replace('%description%',obj.description)
      newHtml = newHtml.replace('%date%', todayDate+'th'+' ' + months[month] +' '+ year )
      newHtml = newHtml.replace('%value%',formatNumber(obj.value, type))

      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
    },
    deleteListItem : function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el)
    },

    clearFields : function(){
      var fields,fieldsArr
      fields = document.querySelectorAll(DomStrings.inputDescription + ' , ' + DomStrings.inputValue)
      fieldsArr = Array.prototype.slice.call(fields)
      
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });

      fieldsArr[0].focus()
    },
    displayBudget : function(obj){
      var type;
      obj.budget > 0 ? type  = 'inc' : type = 'exp'
      document.querySelector(DomStrings.budgetLabel).textContent = formatbudget(obj.budget, type);
      document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
      
      if(obj.percentage > 0 ){
        document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DomStrings.percentageLabel).textContent = '---'
      }
    
    },
    displayPercentages : function(percentages){
      var fields = document.querySelectorAll(DomStrings.expensesPercLabel);
    
    

      nodeListForEach(fields,function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%' 
        }else{
          current.textContent = '---'
        }
      })
    },
    // displayMonth: function(obj){
    //   var now, year,month,months, newDate
    //   now = new Date();
    //   year  = now.getFullYear();

    //   months = ['january','february','March','April','may','June','July','August','September','October','November','December']

    //   month = now.getMonth();


    //   var todayDate = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%Date%</div></div>'
    //   var datedata = DomStrings.datelabel

    //   newData = todayDate.replace('%id%', obj.id)
    //   newData = newData.replace('%Date%', months[month] +' '+ year)

    //   document.querySelector(datedata).insertAdjacentHTML('beforeend', newData)
    // },
    changeType : function(){
      var fields = document.querySelectorAll(DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue)
      
      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DomStrings.inputBtn).classList.toggle('red')
    },
  
    getDomStrings : function(){
      return DomStrings
    }

  }

})();

//CONTROLLER

var controller = (function(budgetCtrl,UICtrl){

  var setupEventListener = function(){
    var Dom = UICtrl.getDomStrings()
    document.querySelector(Dom.inputBtn).addEventListener('click',ctrlAddItem)

    document.addEventListener('keypress',function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    })
    document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(Dom.inputType).addEventListener('change',UICtrl.changeType)
  }

  var updateBudget = function(){
    //.1 calculate the budget
    budgetCtrl.calculateBudget()

    //2. return the budget
    var budget = budgetCtrl.getBudget()

    //3. display the budget in the UI
    UICtrl.displayBudget(budget)
  }

  var updatePercentages = function(){

    //1.calculate the percentage
    budgetCtrl.calculatePercentages()

    //2.read them from the budget controller
    var percentages = budgetCtrl.getPercentages()

    //3. update the user interface
    UICtrl.displayPercentages(percentages)
    
  }
  
  var ctrlAddItem = function(){
    var input, newItem;

    //1. Get the field input data
   input = UICtrl.getInput();
    
    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      //2. Add the item to the budget controller
      newItem =  budgetCtrl.addItem(input.type, input.description, input.value)

      //3. add the item to the UI
      UICtrl.addListItems(newItem, input.type)

      //displayMonth
      // UICtrl.displayMonth(newItem)

      //4. clear the fields
      UICtrl.clearFields()

      //5. Calculate and update budget
      updateBudget()

      //6. calculate and update percentages
      updatePercentages();
    }

  };

  var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      splitID = itemID.split('-')

      type = splitID[0];
      ID = parseInt(splitID[1])
      
      //1. delete the item from the data stucture
      budgetCtrl.deleteItem(type,ID)

      //2. delete the item from the UI
      UICtrl.deleteListItem(itemID);

      //3. update and show the new budget
      updateBudget()

      //4. calculate and update percentages
      updatePercentages();
    }

   

  }

  return {
    init : function(){
      console.log('Application has started')
      // UICtrl.displayMonth()
      UICtrl.displayBudget({
        budget : 0,
        totalInc : 0,
        totalExp: 0,
        percentage: -1
      })
      setupEventListener()
    }
  }
})(budgetController,UIController);

controller.init()