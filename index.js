const pg = require("pg");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const PORT = 5000;

// buat konfigurasi koneksi
// const koneksi = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "api_siak",
//   multipleStatements: true,
// });
// koneksi database
// koneksi.connect((err) => {
//   if (err) throw err;
//   console.log("MySQL Connected...");
// });

const koneksi = new pg.Pool({
  host: "localhost",
  user: "postgres",
  password: "password123",
  database: "my_database",
  port: 5432,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

// set body parser
app.use(cors({ credentials: true, origin: "http://localhost:54318" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// PING
app.get("/", (req, res) => {
  res.json({ msg: "PONG!!!" });
});

// create data / insert data
app.post("/api/mahasiswa", (req, res) => {
  // buat variabel penampung data dan query sql
  const { nama, jurusan } = req.body;
  //   const querySql = "INSERT INTO mahasiswa SET ?";

  // jalankan query
  koneksi.query(
    "INSERT INTO mahasiswa (nama, jurusan) VALUES ($1, $2) RETURNING *",
    [nama, jurusan],
    (err, rows) => {
      // error handling
      if (err) {
        return res
          .status(500)
          .json({ message: "Gagal insert data!", error: err });
      }

      // jika request berhasil
      res.status(201).json({
        success: true,
        message: "Berhasil insert data!",
        data: rows.rows,
      });
    }
  );
});

// read data / get data
app.get("/api/mahasiswa", (req, res) => {
  // buat query sql
  const querySql = "SELECT * FROM mahasiswa";

  // jalankan query
  koneksi.query(querySql, (err, rows) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    console.log(rows);

    // jika request berhasil
    res.status(200).json({ success: true, data: rows.rows });
  });
});

// update data
app.put("/api/mahasiswa/:id", (req, res) => {
  // buat variabel penampung data dan query sql
  const { nama, jurusan } = req.body;
  const id = req.params.id;
  const querySearch = `SELECT * FROM mahasiswa WHERE id = ${id}`;
  const queryUpdate =
    "UPDATE mahasiswa SET nama = $1, jurusan = $2 WHERE id = $3";

  // jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, (err, rows) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.rows[0]) {
      // jalankan query update
      koneksi.query(queryUpdate, [nama, jurusan, id], (err, rows) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }

        // jika update berhasil
        res
          .status(200)
          .json({ success: true, message: "Berhasil update data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// delete data
app.delete("/api/mahasiswa/:id", (req, res) => {
  // buat query sql untuk mencari data dan hapus
  const id = req.params.id;
  const querySearch = `SELECT * FROM mahasiswa WHERE id = ${id}`;
  const queryDelete = `DELETE FROM mahasiswa WHERE id = ${id}`;

  // jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, (err, rows) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.rows[0]) {
      // jalankan query delete
      koneksi.query(queryDelete, (err, rows) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }

        // jika delete berhasil
        res
          .status(200)
          .json({ success: true, message: "Berhasil hapus data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
