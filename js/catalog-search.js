// js/catalog-search.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('catalog-search');
    
    // Ищем все карточки товаров внутри каталога более универсальным способом
    const productCards = document.querySelectorAll('.product-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            productCards.forEach(card => {
                // Ищем элемент с названием товара внутри конкретной карточки
                const titleElement = card.querySelector('.card-title');
                const title = titleElement ? titleElement.textContent.toLowerCase() : '';

                // Если строка поиска пуста или текст совпадает — показываем, иначе скрываем
                if (title.includes(query)) {
                    card.closest('.col').style.display = ''; // Показываем всю колонку с товаром
                } else {
                    card.closest('.col').style.display = 'none'; // Скрываем колонку
                }
            });
        });
    }
});