let todos = [];

const filters = {
    search : '',
    hideCompleted : false
}

$('.search-todo').on('input',()=>{
    console.log($('.search-todo').val());
    filters.search = $('.search-todo').val();
    createList(todos,filters);
})

const renderTodos = function(){
    db.collection('todos').get().then(data=>{
        data.docs.forEach(element =>{
            console.log(element.data());
            const singletodo = element.data();
            todos.push(singletodo);
        })
        createList(todos, filters);
    })
}

// display todos
const createList = function(todos, filters){
    let count = 0;
    const filtedTodos = $.grep(todos, element => {
        return element.name.toLowerCase().includes(filters.search.toLowerCase())
    })
    $('.todos').empty();
    filtedTodos.forEach(element =>{
        let divElement = $('<div class="form-check card singleTodo">');
        let buttonElement = $('<button class="btn btn-danger float-right">');
        let labelElement = $('<label class="form-check-label">');
        let checkboxElement = $('<input type="checkbox" class="form-check-input" />');
        let cardBodyElement = $('<div class="card-body">');
        buttonElement.text('X');
        buttonElement.on('click', ()=>{
            deleteTodo(element);
        })
        checkboxElement.attr('checked',element.isCompleted);
        checkboxElement.on('change', ()=>{
            toggleTodo(element);
        });
        labelElement.append(checkboxElement);
        labelElement.append('<span>'+ element.name +'</span>');
        cardBodyElement.append(labelElement);
        cardBodyElement.append(buttonElement);
        divElement.append(cardBodyElement);
        $('.todos').append(divElement);
        if(element.isCompleted == false){
            count++;
        }
    })
    $('.status').text('You have ' + count + ' todos left');
}

const toggleTodo = function(element) {
    const new_todo = {
        id : element.id,
        isCompleted : !element.isCompleted,
        name: element.name
    }
    db.collection('todos').doc(element.id).update(new_todo).then(()=>{
        console.log("Updated Successfully");
        element.isCompleted = !element.isCompleted;
        createList(todos,filters);
    }).catch(error=>{
        console.log("Error occured", error);
    })
}

const deleteTodo = function(element){
    db.collection('todos').doc(element.id).delete().then(()=>{
        console.log("TODO deleted Successfully");
        const todoIndex = todos.findIndex(todo => todo.id == element.id);
        if(todoIndex!=-1){
            todos.splice(todoIndex,1);
            createList(todos,filters);
        }
    })
}

$('.submit-todo').click((event)=>{
    event.preventDefault();
    const id = uuidv4();
    const todo = {
        name: $('.new-todo').val(),
        isCompleted : false,
        id : id
    }
    db.collection('todos').doc(id).set(todo).then(()=>{
        console.log('Todo added successfully');
        $('.new-todo').val('');
        todos.push(todo);
        createList(todos,filters);
    }).catch(error =>{
        console.log('ERROR OCCURED',error);
    })
})

$('.hidecompleted').change(()=>{
    if($('.hidecompleted').prop('checked')){
        hideCompleted(todos,filters);
    }else{
        createList(todos,filters);
    }
})

const hideCompleted = function(todos,filters){
    const filteredTodos = $.grep(todos,(element)=>{
        if(element.isCompleted == filters.hideCompleted){
            return element
        }
    });
    createList(filteredTodos,filters);
}


renderTodos();
