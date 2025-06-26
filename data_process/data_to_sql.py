import pandas as pd
import mysql.connector
from mysql.connector import errorcode

csv_file_path = 'data.csv'
data = pd.read_csv(csv_file_path)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'charge'
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    table_name = 'geo'

    columns = data.columns
    column_definitions = ', '.join([f"`{col}` VARCHAR(255)" for col in columns])

    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        {column_definitions}
    );
    """

    cursor.execute(create_table_query)
    print(f"Table `{table_name}` created successfully (if it didn't exist).")

    insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(['%s'] * len(columns))});"

    for _, row in data.iterrows():
        cursor.execute(insert_query, tuple(row))

    conn.commit()
    print(f"Inserted {len(data)} rows into `{table_name}`.")

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    elif err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Access denied, check your username/password")
    else:
        print(f"Error: {err}")

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
