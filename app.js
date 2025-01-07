document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
    const cartItemsCount = document.getElementById('cart-items-count');
    const cartTotal = document.getElementById('cart-total');
    const cartDetails = document.getElementById('cart-details');
    const adminSection = document.getElementById('admin-panel'); // Admin section
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const closeRegisterBtn = document.getElementById('close-register');
    const closeLoginBtn = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const adminBtn = document.getElementById('admin-btn');
	const closeAdminBtn = document.getElementById("close-admin");
	 const addProductBtn = document.getElementById("add-product-btn");
    const editProductBtn = document.getElementById("edit-product-btn");
   

    const addProductModal = document.getElementById("add-product-modal");
    const editProductModal = document.getElementById("edit-product-modal");
    const deleteProductModal = document.getElementById("delete-product-modal");

    const closeAddProductBtn = document.getElementById("close-add-product");
    const closeEditProductBtn = document.getElementById("close-edit-product");
   

    const cancelDeleteProductBtn = document.getElementById("cancel-delete-product");
    const adminDeleteBtn = document.getElementsByClassName('admin-delete');
	
	
    let cart = [];
    let userRole = localStorage.getItem('userRole'); // Retrieve the role from localStorage
    
    // Function to update cart
function updateCart() {
    cartItemsCount.textContent = `Товары в корзине: ${cart.length}`;
    const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
    cartTotal.textContent = `Итого: ${total} Р`;

    cartDetails.innerHTML = '';
    const cartGrouped = groupCartItems(cart);
    cartGrouped.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('cart-item');
        
        // Добавляем картинку товара
        const productImage = document.createElement('img');
        productImage.src = item.url;
        productImage.alt = item.name;
        productImage.classList.add('cart-item-image');
        productImage.style.width = '50px'; // Устанавливаем размер изображения
        productImage.style.height = '50px';
        productImage.style.marginRight = '10px';
        
        // Информация о товаре
        const productInfo = document.createElement('div');
        productInfo.classList.add('cart-item-info');
        productInfo.innerHTML = `
            ${item.name} - ${item.quantity} шт. (${item.price * item.quantity} Р)
        `;

        // Собираем карточку товара
        productDiv.appendChild(productImage);
        productDiv.appendChild(productInfo);

        cartDetails.appendChild(productDiv);
    });
}


    // Group cart items by product ID
    function groupCartItems(cart) {
        const grouped = {};
        cart.forEach(product => {
            if (grouped[product.id]) {
                grouped[product.id].quantity += product.quantity;
            } else {
                grouped[product.id] = { ...product };
            }
        });
        return Object.values(grouped);
    }
	
	const saveChangesBtn = document.getElementById('save-product-changes');
	const editProductModall = document.getElementById('edit-product-modal');
	// Функция для открытия модального окна и заполнения полей
	function openEditModal(product) {
		// Заполняем поля данными товара
		document.getElementById('edit-product-name').value = product.name;
		document.getElementById('edit-product-price').value = product.price;
	
		console.log(product.description);
		// Открыть модальное окно
		editProductModall.style.display = "block";

		// Обработчик для сохранения изменений
		saveChangesBtn.onclick = () => {
			const updatedProduct = {
				name: document.getElementById('edit-product-name').value,
				price: document.getElementById('edit-product-price').value,
			
			};
			console.log(updatedProduct);
			// Отправка PUT запроса на сервер для редактирования товара
			fetch(`http://localhost:3000/products/${product.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedProduct),
			})
			.then(response => response.json())
			.then(data => {
				alert('Товар успешно обновлен!');
				loadProducts(); // Перезагрузить список продуктов
				editProductModal.style.display = "none"; // Закрыть модальное окно
			})
			.catch(error => {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при редактировании товара');
			});
		};
	}
	
	
    // Load products and display them
    function loadProducts() {
		 // Очистка контейнера продуктов перед добавлением новых
		
		productsContainer.innerHTML = '';
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(products => {
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
					
                        <h2>${product.name}</h2>
						 <img
							src=${product.url}
							alt="Product Image"
							class="product-image"
							onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Available';"
						/>
                        <p>Цена: ${product.price} Р</p>
				<button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-url="${product.url}">В корзину</button>
						
						<button class="admin-change"> Редактировать </button>
						<div data-id="${product.id}" class="close-admin admin-delete">
							<img
								src="https://cdn-icons-png.flaticon.com/512/3817/3817209.png"
								class="dlt-btn"
								onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Available';"
							/>
						</div>
                    `;
					// Обработчик кнопки редактирования
					const editBtn = productCard.querySelector('.admin-change');
					if(userRole == "admin")
					{
						editBtn.style.display = 'block';
					}
					else
					{
						editBtn.style.display = 'none';
					}
					
					editBtn.addEventListener('click', () => {
						openEditModal(product); // Открытие модального окна с данным товаром
					});
					// Находим кнопку удаления внутри карточки
					const deleteBtn = productCard.querySelector('.admin-delete');

					// Добавляем обработчик клика
					deleteBtn.addEventListener('click', () => {
						console.log(`Удаление продукта с ID: ${product.id}`);
						if (product.id) {
							fetch(`http://localhost:3000/products/${product.id}`, {
								method: 'DELETE',
							})
								.then(response => {
									if (response.ok) {
										alert('Продукт удален');
										loadProducts(); // Перезагрузить список продуктов
										deleteProductModal.style.display = "none"; // Закрыть модальное окно
									} else {
										alert('Не удалось удалить продукт');
									}
								})
								.catch(error => {
									console.error('Ошибка при удалении продукта:', error);
									alert('Ошибка при удалении продукта');
								});
						} else {
							alert('Введите корректный ID продукта');
						}
					});
                    productsContainer.appendChild(productCard);
                });

                // Add to cart functionality
                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.target.dataset.id;
                        const productName = e.target.dataset.name;
                        const productPrice = parseInt(e.target.dataset.price);
						 const productUrl = e.target.dataset.url; // Получаем URL изображения

                        const existingProduct = cart.find(product => product.id === productId);
                        if (existingProduct) {
                            existingProduct.quantity += 1;
                        } else {
                            cart.push({ id: productId, name: productName, price: productPrice, quantity: 1,url: productUrl });
                        }

                        updateCart();
                    });
                });
				
                // If user is admin, show admin controls
				for(let element of adminDeleteBtn)
				{
					if(userRole == 'admin')
					{
						element.style.display = 'block';
					}
					else
					{
						element.style.display = 'none';
					}
				}
                if (userRole == 'admin') {
                    adminBtn.style.display = 'block';
					
                }
				else
				{
					adminBtn.style.display = 'none';
					
				}
            })
            .catch(error => console.error('Ошибка при загрузке продуктов:', error));
    }

    // Функция для отображения контролей администратора
	function showAdminControls(products) {
		adminSection.style.display = 'block';

		// Кнопка добавления товара
		const addProductButton = document.createElement('button');
		addProductButton.textContent = 'Добавить продукт';
		addProductButton.addEventListener('click', () => {
			openAddProductModal();
		});
		adminSection.appendChild(addProductButton);

		// Кнопка удаления товара
		const deleteProductButton = document.createElement('button');
		deleteProductButton.textContent = 'Удалить продукт';
		deleteProductButton.addEventListener('click', () => {
			openDeleteProductModal();
		});
		adminSection.appendChild(deleteProductButton);
	}

	// Открытие модального окна для добавления товара
	function openAddProductModal() {
		const addProductModal = document.getElementById("add-product-modal");
		const closeAddProductModal = document.getElementById("close-add-product");
		const submitAddProductBtn = document.getElementById("submit-add-product");
		
	
		
		addProductModal.style.display = "block";
		
		closeAddProductModal.addEventListener("click", () => {
			addProductModal.style.display = "none";
		});
		
		
		// Обработчик отправки формы добавления товара
		submitAddProductBtn.addEventListener('click',  () => {
			
			const name = document.getElementById("product-name").value;
			const url = document.getElementById("product-url").value;
			const price = parseFloat(document.getElementById("product-price").value);

			if (name && !isNaN(price)) {
				const newProduct = { name, price, url };
				console.log(newProduct);
				fetch('http://localhost:3000/products', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newProduct),
				})
					.then(response => response.json())
					.then(product => {
						
						loadProducts(); // Перезагрузить список продуктов
						addProductModal.style.display = 'none'; // Закрыть модальное окно
					})
					.catch(error => {
						console.error('Ошибка при добавлении продукта:', error);
						
					});
			} else {
				alert('Пожалуйста, заполните корректно все поля');
			}
			location.reload();

		});
		
	}
	
	// Открытие модального окна для удаления товара
	function openDeleteProductModal() {
		const deleteProductModal = document.getElementById("delete-product-modal");
		const closeDeleteProductModal = document.getElementById("close-delete-product");
		const submitDeleteProductBtn = document.getElementById("submit-delete-product");

		deleteProductModal.style.display = "block";
		closeDeleteProductModal.addEventListener("click", () => {
			deleteProductModal.style.display = "none";
		});

		// Обработчик отправки формы удаления товара
		submitDeleteProductBtn.addEventListener('click', () => {
			const productId = document.getElementById("delete-product-id").value;

			if (productId) {
				fetch(`http://localhost:3000/products/${productId}`, {
					method: 'DELETE',
				})
					.then(response => {
						if (response.ok) {
							alert('Продукт удален');
							loadProducts(); // Перезагрузить список продуктов
							deleteProductModal.style.display = "none"; // Закрыть модальное окно
						} else {
							alert('Не удалось удалить продукт');
						}
					})
					.catch(error => {
						console.error('Ошибка при удалении продукта:', error);
						alert('Ошибка при удалении продукта');
					});
			} else {
				alert('Введите корректный ID продукта');
			}
		});
	}


    // Handle login
    async function handleLogin() {
		
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }

        const userCredentials = { email, password };

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userCredentials),
            });

            if (response.ok) {
                const userData = await response.json();
                alert('Вы успешно вошли!');
                userRole = userData.role; // Store role in localStorage
                localStorage.setItem('userRole', userRole);
                loginModal.style.display = 'none';
				console.log(userData);
                loadProducts(); // Reload products after successful login
				
            } else {
                alert('Неверная электронная почта или пароль!');
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
        }
    }

    // Handle registration
    async function handleRegister() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!username || !email || !password) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }

        const newUser = { username, email, password };

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (response.ok) {
                alert('Регистрация успешна!');
                registerModal.style.display = 'none';
            } else {
                alert('Ошибка при регистрации!');
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
        }
    }
	
	
	// Получаем элементы
	const cartModalContainer = document.getElementById('cart-modal-container');
	const openCartModal = document.getElementById('open-cart-modal');
	const closeCartModal = document.getElementById('close-cart-modal');
	const closeModalt = document.getElementById('close-modalt');
	const paybtn = document.getElementById('payment-btn');
	//оплата
	paybtn.addEventListener('click', () => {
		alert("оплата прошла успешно");
	});
	// Закрытие модального окна
	closeModalt.addEventListener('click', () => {
		editProductModall.style.display = "none";
	});
	// Открытие модального окна
	openCartModal.onclick = function() {
		cartModalContainer.style.display = "block";
	}

	// Закрытие модального окна
	closeCartModal.onclick = function() {
		cartModalContainer.style.display = "none";
	}

	// Закрытие модального окна при клике вне его
	window.onclick = function(event) {
		if (event.target === cartModalContainer) {
			cartModalContainer.style.display = "none";
		}
}

    // Event Listeners for modals
	// Добавляем обработчик на каждую кнопку


	// Открытие модального окна для добавления товара
    addProductBtn.addEventListener("click", function() {
		adminSection.style.display = "none";
		openAddProductModal();
        addProductModal.style.display = "block";
    });

   

   

    // Закрытие модального окна добавления товара
    closeAddProductBtn.addEventListener("click", function() {
        addProductModal.style.display = "none";
    });

  
    

    // Закрытие модального окна при клике вне модального окна
    window.addEventListener("click", function(event) {
        if (event.target === addProductModal) {
            addProductModal.style.display = "none";
        } else if (event.target === editProductModal) {
            editProductModal.style.display = "none";
        } else if (event.target === deleteProductModal) {
            deleteProductModal.style.display = "none";
        }
    });

    // Отмена удаления товара
    cancelDeleteProductBtn.addEventListener("click", function() {
        deleteProductModal.style.display = "none";
    });
    closeAdminBtn.addEventListener("click", function() {
        adminSection.style.display = "none";
    });
	adminBtn.addEventListener("click", () => {
        adminSection.style.display = "block"; // Открыть панель администратора
    });
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    closeRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });

    closeLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Initialize
    loadProducts();
});
