import sqlite3, sqlite_vec, os
from settings import DATABASE_DIR


class VectorDatabase:
    def __init__(self, db_name: str, embedding_size: int = None):
        """
        Creates connection to the database given the name.
        If the database is not created, the user needs to specify
        the embedding_size for the embeddings to be stored in
        a default table of text_embeddings in the database.
        """
        if embedding_size is None:
            db_path = os.path.join(DATABASE_DIR, db_name)
            if not os.path.exists(db_path):
                raise FileNotFoundError(
                    f"Database with the name {db_name} does not exist. Please pass embedding size to initialize a new database."
                )
        self._db_name = db_name
        self._embedding_size = embedding_size if embedding_size is not None else 250
        self._embedding_table_name = "text_embeddings"
        self._db_path = os.path.join(DATABASE_DIR, self._db_name)
        self._db = self.__make_connection()

        self.sample_db = SampleDatabase(self._db_path)

    def __make_connection(self):
        """
        Creates connection with the given database and keeps
        the connection open.
        """
        connection = sqlite3.connect(self._db_path)
        connection.enable_load_extension(True)
        sqlite_vec.load(connection)
        connection.enable_load_extension(False)

        connection.execute(
            f"""
            CREATE VIRTUAL TABLE IF NOT EXISTS {self._embedding_table_name}
            USING vec0(sample_embedding float[{self._embedding_size}]);
            """
        )
        connection.commit()

        return connection

    def get_db(self):
        return self._db

    def insert_embeddings(self, text: str, vector):
        """
        Convert the string embedding value to vectorized
        embedding and store it in the database.
        """
        serialized_vector = sqlite_vec.serialize_float32(vector)
        cursor = self._db.cursor()

        # Insert into the embeddings table
        cursor.execute(
            f"INSERT INTO {self._embedding_table_name} (sample_embedding) VALUES (?)",
            (serialized_vector,),
        )
        row_id = cursor.lastrowid  # Get the row ID of the last inserted record
        self._db.commit()

        # Insert the text sample into the sample_text table
        self.sample_db.insert_sample(row_id, text)

    def get_version(self):
        (vec_version,) = self._db.execute("SELECT vec_version()").fetchone()
        return vec_version

    def execute_instruction(self, statement: str, **values):
        try:
            cursor = self._db.execute(statement, values)
            self._db.commit()
            return cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Error executing statement: {e}")
            return None

    def close_connection(self):
        if self._db:
            self._db.close()

    def get_db_name(self):
        return self._db_name

    def get_db_path(self):
        return self._db_path


class SampleDatabase:
    def __init__(self, db_path: str):
        """
        Initialize connection to the sample text database.
        """
        self._db_path = db_path
        self._table_name = "sample_text"
        self._db = self.__make_connection()

        # Create the sample_text table if it doesn't exist
        self.__create_table()

    def __make_connection(self):
        """
        Create or open a connection to the same database used by VectorDatabase.
        """
        connection = sqlite3.connect(self._db_path)
        return connection

    def __create_table(self):
        """
        Create the sample_text table that stores the row ID of the embedding
        and the corresponding text.
        """
        self._db.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {self._table_name} (
                id INTEGER PRIMARY KEY,
                embedding_rowid INTEGER,
                text TEXT,
                FOREIGN KEY (embedding_rowid) REFERENCES text_embeddings(rowid)
            );
            """
        )
        self._db.commit()

    def insert_sample(self, row_id: int, text: str):
        """
        Insert a sample text with the corresponding embedding row ID.
        """
        self._db.execute(
            f"INSERT INTO {self._table_name} (embedding_rowid, text) VALUES (?, ?)",
            (row_id, text),
        )
        self._db.commit()

    def get_sample_by_embedding_id(self, embedding_rowid: int):
        """
        Fetch the sample text by the row ID of the embedding.
        """
        cursor = self._db.execute(
            f"SELECT text FROM {self._table_name} WHERE embedding_rowid = ?",
            (embedding_rowid,),
        )
        result = cursor.fetchone()
        return result[0] if result else None

    def get_all_samples(self):
        """
        Retrieve all records from the sample_text table.
        """
        cursor = self._db.execute(
            f"SELECT embedding_rowid, text FROM {self._table_name}"
        )
        return cursor.fetchall()

    def close_connection(self):
        if self._db:
            self._db.close()
