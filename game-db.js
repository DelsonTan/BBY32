"use strict";

const mysql = require("mysql2/promise");
const { dbName, dbUserTable, connectionParams } = require("./constants");

//Get questions
async function getQuestions(res) {
  try {
    const connection = await mysql.createConnection({
      ...connectionParams,
      database: dbName,
    });
    const [row, fields] = await connection.execute("SELECT * FROM QUESTION");
    return res.send(row);
  } catch (error) {
    console.error(error);
    res.send({ status: 500, message: "Internal server error." });
  }
}

//Get choices
async function getChoices(questionID, res) {
  const connection = await mysql.createConnection({
    ...connectionParams,
    database: dbName,
  });
  var [row, fields] = await connection.execute(
    "SELECT * FROM CHOICE WHERE question_id = " + questionID
  );
  if (row == 0) {
    return res.send({ status: 200, message: "No choice found." });
  }
  res.send(row);
}

//Add or update new question
async function updateQuestion(questionText, questionID, callback) {
  const connection = await mysql.createConnection({
    ...connectionParams,
    database: dbName,
  });
  try {
    if (!questionText) {
      return callback({
        status: 400,
        message: "No question typed in.",
      });
    }
    var checkQuestionID = "SELECT * FROM QUESTION WHERE ID = ? LIMIT 1;";
    var checkQuestionText =
      "SELECT * FROM QUESTION WHERE question = ? LIMIT 1;";
    var updateQuestion = "UPDATE QUESTION SET question = ? WHERE ID = ?";
    var insertQuestion = "INSERT QUESTION (question) values (?)";
    var [existingQuestionID] = await connection.query(checkQuestionID, [
      questionID,
    ]);
    var [existingQuestionText] = await connection.query(checkQuestionText, [
      questionText,
    ]);
    if (existingQuestionID.length == 1) {
      await connection.query(updateQuestion, [questionText, questionID]);
      return callback({
        status: 200,
        message: "Question updated.",
      });
    }
    if (existingQuestionID.length == 0 && existingQuestionText.length == 1) {
      return callback({
        status: 400,
        message: "Question already exsits.",
      });
    }
    await connection.query(insertQuestion, [questionText]);
    return callback({
      status: 200,
      message: "New question added.",
    });
  } catch (error) {
    console.error(error);
    return callback({ status: 500, message: "Internal server error." });
  }
}

//Add or update choice
async function updateChoice(
  questionID,
  optionID,
  text,
  envi,
  comf,
  nextQuestion,
  callback
) {
  const connection = await mysql.createConnection({
    ...connectionParams,
    database: dbName,
  });
  try {
    if (!questionID) {
      return callback({
        status: 400,
        message: "No question selected.",
      });
    }
    if (!envi || !comf || !nextQuestion || !text) {
      return callback({
        status: 400,
        message: "Input is not complete.",
      });
    }
    var checkOption = "SELECT * FROM CHOICE WHERE question_id = ? AND ID = ?";
    var updateOption =
      "UPDATE CHOICE SET text = ?, env_pt = ?, com_pt = ?, next_q = ? WHERE question_id = ? AND ID = ?";
    var insertOption =
      "INSERT CHOICE (question_id, text, env_pt, com_pt, next_q) values (?, ?, ?, ?, ?)";
    var [existingOption] = await connection.query(checkOption, [
      questionID,
      optionID,
    ]);
    if (existingOption.length == 1) {
      await connection.query(updateOption, [
        text,
        envi,
        comf,
        nextQuestion,
        questionID,
        optionID,
      ]);
      return callback({
        status: 200,
        message: "Choice updated.",
      });
    }
    await connection.query(insertOption, [
      questionID,
      text,
      envi,
      comf,
      nextQuestion,
    ]);
    return callback({
      status: 200,
      message: "Choice inserted.",
    });
  } catch (error) {
    console.error(error);
    return callback({ status: 500, message: "Internal server error." });
  }
}

//Delete question or choice
async function deleteQuestion(questionID, optionID, res) {
  const connection = await mysql.createConnection({
    ...connectionParams,
    database: dbName,
  });
  try {
    if (!optionID) {
      await connection.execute("DELETE FROM QUESTION WHERE ID = " + questionID);
      await connection.execute(
        "DELETE FROM CHOICE WHERE question_id = " + questionID
      );
      return res.send({ status: 204, message: "Question deleted." });
    }
    await connection.execute(
      "DELETE FROM CHOICE WHERE question_id = " +
        questionID +
        " AND ID = " +
        optionID
    );
    return res.send({ status: 204, message: "Choice deleted." });
  } catch (error) {
    console.error(error);
    return res.send({ status: 500, message: "Internal server error." });
  }
}

// Fisher-Yates Shuffle
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

async function startPlaythrough(uuid, callback) {
  try {
    const connection = await mysql.createConnection(connectionParams);
    const [[user]] = await connection.query(`SELECT uuid, name, email, role FROM ${dbUserTable} WHERE uuid = ? LIMIT 1;`, uuid);
    console.log(user);
    // const insertPlaythroughQuery = `INSERT INTO PLAYTHROUGH (user_id) values ? `;
    const playthrough = { id: 1 };
    const numQuestions = 3;
    const [questions] = await connection.execute("SELECT * FROM QUESTION");
    const selectedQuestions = shuffle(questions).slice(0, numQuestions);
    console.log(selectedQuestions);
    return callback({
      status: 200,
      message: "Successfully started playthrough.",
      playthrough,
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error("Error starting playthrough: ", error);
    return callback({
      status: 500,
      message: "Internal error while attempting to start playthrough.",
    });
  }
}

module.exports = {
  getQuestions,
  getChoices,
  updateQuestion,
  updateChoice,
  deleteQuestion,
  startPlaythrough,
};
