const transactionStore = "taskListStore";
const taskDBString = "taskDB";

const taskObjectStore = [
  "id",
  "title",
  "hour",
  "mins",
  "day",
  "month",
  "year",
  "isCompleted",
];
let taskDB;
// starting templates
const taskForm = document.querySelector("#taskForm");
const title = document.querySelector("#title");
const hour = document.querySelector("#hour");
const mins = document.querySelector("#mins");
const day = document.querySelector("#day");
const month = document.querySelector("#month");
const year = document.querySelector("#year");
const taskList = document.querySelector("#task-list");

const openDb = indexedDB.open(taskDBString, 3);

openDb.onsuccess = (event)=>{
taskDB = event.target.result
getAllTask()
}
openDb.onupgradeneeded = (event) => {
  taskDB = event.target.result;
  let objectStore;

  taskDB.onerror = () => {
    console.log("error");
  };

  if (!taskDB.objectStoreNames.contains(transactionStore)) {
    objectStore = taskDB.createObjectStore(transactionStore, {
      keyPath: "id",
      autoIncrement: true,
    });
    taskObjectStore.forEach((value) => {
      objectStore.createIndex(value, value);
    });
  } else {
    objectStore = event.target.transaction.objectStore(transactionStore);
    taskObjectStore.forEach((value) => {
      objectStore.createIndex(value, value);
    });
  }
};
// form event listener
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (
      title.value == "" ||
      hour.value == "" ||
      mins.value == "" ||
      day.value == "" ||
      month.value == "" ||
      year == ""
    ) {
        alert("All Fields are required")
    }
    const newTask = {
        title:title.value,
        hour: hour.value,
        mins: mins.value,
        day: day.value,
        month : month.value,
        year: year.value,
        isCompleted: false,
    }
    const taskListTransaction = taskDB.transaction(transactionStore,"readwrite")
    const taskObjectStore = taskListTransaction.objectStore(transactionStore)
    const addItemRequest = taskObjectStore.add(newTask);

    addItemRequest.onsuccess = (event) => {
        getAllTask();
        console.log("Task Created")
        title.value = ""
        hour.value = ""
        mins.value = ""
        day.value = ""
        month.value  = ""
        year.value = ""
    }
  });
}

function getAllTask (){
    taskList.innerHTML = "" 

    const taskListTransaction = taskDB.transaction(transactionStore,"readwrite")
    const taskObjectStore = taskListTransaction.objectStore(transactionStore)
    
    taskObjectStore.openCursor().onsuccess = (event)=>{
            const cursor = event.target.result
        if(cursor){
            const task = cursor.value
            const div = document.createElement("div")
            div.innerHTML = `
            <div class="flex items-center gap-4">
            <button onclick="updateTask(${task.id})"  type="button" role="checkbox" aria-checked="false" data-state="${
                  task.isCompleted ? "checked" : "unchecked"
                }" value="on"
                class="peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                id="todo1">
                <span class="sr-only">Check</span>
            </button>
            <div class="flex flex-col flex-1">
                <label
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.isCompleted ? "line-through" : ""
                    }
                    for="todo1">
                   ${task.title}
                </label>
                <p class="text-sm">${task.day}-${task.month}-${task.year} </p>
            </div>
            <button onclick="deleteTask(${task.id})"
                class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="w-4 h-4">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg><span class="sr-only">Delete task</span>
            </button>
            </div>  `
            taskList.appendChild(div);
            cursor.continue()
        }

    }
}

function updateTask(id) {
    const taskListTransaction = taskDB.transaction(transactionStore,"readwrite")
    const taskObjectStore = taskListTransaction.objectStore(transactionStore)
    const taskRequest  = taskObjectStore.get(id);

    taskRequest.onsuccess = (event)=>{
        const taskResponse = event.target.result
        taskResponse.isCompleted = !taskResponse?.isCompleted;

        const taskUpdate = taskObjectStore.put(taskResponse);

        taskUpdate.onsuccess = (event)=>{
            getAllTask()
        }
    }
}


function deleteTask(id){
    const taskListTransaction = taskDB.transaction(transactionStore,"readwrite")
    const taskObjectStore = taskListTransaction.objectStore(transactionStore)
    const taskRequest  = taskObjectStore.delete(id);

    taskRequest.onsuccess = ()=> {
        getAllTask()
    }
}
// List all tasks ui
/*
div.innerHTML = `
<div class="flex items-center gap-4">
<button  type="button" role="checkbox" aria-checked="false" data-state="${
      task.isCompleted ? "checked" : "unchecked"
    }" value="on"
    class="peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
    id="todo1">
    <span class="sr-only">Check</span>
</button>
<div class="flex flex-col flex-1">
    <label
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
          task.completed ? "line-through" : ""
        }
        for="todo1">
       Test
    </label>
    <p class="text-sm">01 Jan 2001 </p>
</div>
<button
    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-4 h-4">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg><span class="sr-only">Delete task</span>
</button>
</div>
  `;

  */
