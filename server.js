// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import cors package

const app = express();
const PORT = 3000;

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// Use CORS middleware
app.use(cors());  // This allows all origins, you can customize it if needed


// API endpoint to fetch products
app.get('/products', (req, res) => {
    const filePath = path.join(__dirname, 'products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(JSON.parse(data));
        }
    });
});




app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body; // Данные для обновления

    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading products data.' });

        let products = [];

        try {
            products = JSON.parse(data); // Парсим существующий JSON
        } catch (parseErr) {
            return res.status(500).json({ error: 'Error parsing products data.' });
        }

        // Находим продукт по ID
        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Обновляем данные товара
        products[productIndex] = { ...products[productIndex], ...updatedProduct };

        // Записываем обновленные данные в файл
        fs.writeFile('products.json', JSON.stringify(products, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Error writing products data.' });
            res.status(200).json(products[productIndex]);
        });
    });
});



app.post('/products', (req, res) => {
    const newProduct = req.body;

    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading products data.' });

        let products = [];

        try {
            products = JSON.parse(data); // Парсим существующий JSON
        } catch (parseErr) {
            return res.status(500).json({ error: 'Error parsing products data.' });
        }

        // Определяем следующий ID
        const nextId = products.length > 0 ? Math.max(...products.map(product => product.id || 0)) + 1 : 1;
        newProduct.id = String(nextId);

        products.push(newProduct);

        fs.writeFile('products.json', JSON.stringify(products, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Error writing products data.' });
            res.status(201).json(newProduct);
        });
    });
});


app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;

    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading products data.' });

        let products = JSON.parse(data);
        products = products.filter(product => product.id !== productId);

        fs.writeFile('products.json', JSON.stringify(products, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Error writing products data.' });
            res.status(200).json({ message: 'Product deleted successfully.' });
        });
    });
});

// Handle registration
app.post('/register', (req, res) => {
    const newUser = req.body;
     // Assign default role to the new user
    newUser.role = 'user';
    // Read users from users.json
    fs.readFile('users.json', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading users file' });
        }

        let users = JSON.parse(data);

        // Check if user already exists
        const userExists = users.some(user => user.email === newUser.email);
        if (userExists) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует!' });
        }

        // Add new user to the list
        users.push(newUser);

        // Write updated users list to users.json
        fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error saving user' });
            }
            res.status(200).json({ message: 'User registered successfully!' });
        });
    });
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Read users from users.json
    fs.readFile('users.json', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading users file' });
        }

        let users = JSON.parse(data);

        // Check for user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            // Return user role along with the success message
            return res.status(200).json({
                message: 'Login successful!',
                role: user.role // Assuming the 'role' field exists in your user data
            });
        } else {
            return res.status(400).json({ error: 'Invalid email or password!' });
        }
    });
});





app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
