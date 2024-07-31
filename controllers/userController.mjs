import xss from "xss";
import validator from "validator";

function getIndexPage(req, res) {
  res.sendFile("index.html", { root: "./public/html" });
}

function checkValues(name, age, res) {
  if (typeof name !== "string") {
    name = String(name);
  }

  if (typeof age !== "string") {
    age = String(age);
  }

  if (!/^[A-Za-zА-Яа-яёЁ\s]+$/.test(name) || !/^[0-9\.,]+$/.test(age)) {
    res.json({ success: false });
    return null;
  }

  let sanitizedName = validator.escape(name);
  sanitizedName = xss(sanitizedName);
  let sanitizedAge = validator.escape(age);
  sanitizedAge = xss(sanitizedAge);
  return [sanitizedName, Number(sanitizedAge)];
}

async function getOneUser(req, res) {
  try {
    const users = req.app.locals.collection;
    const name = req.body.name;
    const age = parseInt(req.body.age);
    const sanitizedValues = checkValues(name, age, res);
    if (!sanitizedValues) {
      return;
    }
    const [sanitizedName, sanitizedAge] = sanitizedValues;
    const results = await users
      .find({ name: sanitizedName, age: sanitizedAge })
      .toArray();
    return res.json({ results, success: true });
  } catch (error) {
    console.error(error);
  }
}

async function deleteUser(req, res) {
  try {
    const users = req.app.locals.collection;
    const result = await users.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount) res.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}

async function addUser(req, res) {
  try {
    const users = req.app.locals.collection;
    const name = req.body.name;
    const age = parseInt(req.body.age);
    const sanitizedValues = checkValues(name, age, res);
    if (!sanitizedValues) {
      return;
    }
    const [sanitizedName, sanitizedAge] = sanitizedValues;
    const lastPost = await users.find().limit(1).sort({ id: -1 }).toArray();
    let lastId = lastPost[0]?.id;
    if (typeof lastId === "undefined") {
      lastId = -1;
    }
    await users.insertOne({ name: sanitizedName, age: sanitizedAge, id: parseInt(lastId) + 1 });
    res.json({ success: true });
  } catch (error) {
    console.error(error); 
  }
}

async function editUser(req, res) {
  try {
    const users = req.app.locals.collection;
    const name = req.body.name;
    const age = parseInt(req.body.age);
    const sanitizedValues = checkValues(name, age, res);
    if (!sanitizedValues) {
      return;
    }
    const [sanitizedName, sanitizedAge] = sanitizedValues;
    const id = parseInt(req.params.id);
    await users.updateOne(
      { id: id },
      {
        $set: {
          name: sanitizedName,
          age: sanitizedAge,
        },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}

async function con(req, res) {
  try {
    const users = req.app.locals.collection;
    const results = await users.find().toArray();
    res.json(results);
  } catch (error) {
    return console.error(error);
  }
}

export { getOneUser, deleteUser, addUser, editUser, con, getIndexPage };
