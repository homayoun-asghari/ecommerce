from faker import Faker
import random
import csv

# Initialize Faker instance
fake = Faker()

# Define roles
roles = ['buyer', 'seller', 'admin']

# Generate dummy users
def generate_user_data(num_users=100):
    users = []
    for _ in range(num_users):
        username = fake.user_name()
        email = fake.email()
        password_hash = fake.password()  # In practice, store hashed passwords, not plain text
        role = random.choice(roles)
        users.append([username, email, password_hash, role])
    return users

# Write to CSV
def write_to_csv(filename, data):
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['username', 'email', 'password_hash', 'role'])
        writer.writerows(data)

# Generate 100 users
users = generate_user_data(100)

# Write users to CSV
write_to_csv('users.csv', users)
