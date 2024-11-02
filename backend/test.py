from database_wrappers import VectorDatabase

db = VectorDatabase("my_db3.db")

print(db.get_version())

db2 = VectorDatabase("my_db7.db")

print(db2.get_version())
