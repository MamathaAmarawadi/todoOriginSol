const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () =>
      console.log("Server Running at http://localhost:3001/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStatusAndPriority = (g) => {
  return g.priority !== undefined && g.status !== undefined;
};
const convertStatus = (e) => {
  return e.status !== undefined;
};

const convertPriority = (f) => {
  return f.priority !== undefined;
};
app.get("/todos/", async (request, response) => {
  let query1 = "";
  let data = null;
  const { priority, status, search_q = "" } = request.query;
  switch (true) {
    case convertStatusAndPriority(request.query):
      query1 = `
      select * from todo where
      priority='${priority}' AND status='${status}'
      AND todo LIKE '%${search_q}%';`;

      break;
    case convertStatus(request.query):
      query1 = `
      select * from todo where
     status='${status}'
      AND todo LIKE '%${search_q}%';`;

      break;
    case convertPriority(request.query):
      query1 = `
      select * from todo where
     priority='${priority}'
      AND todo LIKE '%${search_q}%';`;
      break;
    default:
      query1 = `
      select * from todo where
    
       todo LIKE '%${search_q}%';`;
      break;
  }
  data = await db.all(query1);
  response.send(data);
});

//method-2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `select
   * from todo
   where id='${todoId}';`;
  const tableDetails = await db.get(todoQuery);
  //const { id, todo, status } = tableDetails;

  //const { todoPriority, todoStatus } = tableDetails;
  response.send(tableDetails);
});

//method-3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const todoQuery = `insert into todo(id,todo,priority,status)
  values('${id}',
    '${todo}',
    '${priority}',
    '${status}');`;
  await db.run(todoQuery);
  //const { id, todo, status } = tableDetails;

  //const { todoPriority, todoStatus } = tableDetails;
  response.send("Todo Successfully Added");
});
//method 4

const funPriority = (i) => {
  return i.priority !== undefined;
};
const funStatus = (j) => {
  return j.status !== undefined;
};
const funTodo = (k) => {
  return k.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  //response.send(todoId);
  let text1 = "";
  const { priority = "", status = "", todo = "" } = request.body;

  let query2 = "";

  if (priority !== "") {
    query2 = `update todo set priority='${priority}'
            where id='${todoId}';`;
    await db.run(query2);
    text1 = "Priority Updated";
    response.send(text1);
  } else if (status !== "") {
    query2 = `update todo set status='${status}'
            where id='${todoId}';`;
    await db.run(query2);
    text1 = "Status Updated";
    response.send(text1);
  } else {
    query2 = `update todo set todo='${todo}'
            where id='${todoId}';`;
    await db.run(query2);
    text1 = "Todo Updated";
    response.send(text1);
  }
});

//method 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const q1 = `delete from todo where id='${todoId}';`;
  await db.run(q1);
  response.send("Todo Deleted");
});

module.exports = app;
