//traducciones
const translations = {
  parrafo1: {
    es: `En EMI sabemos que cada persona aprende a su propio ritmo.\n Por eso, esta <strong>plataforma gratuita y oficial</strong> de la\n <strong>Secretaría de Educación Pública</strong> está pensada para que refuerces, repases y practiques tu inglés \n <strong>donde quieras y cuando quieras</strong>, con recursos que se adapten a ti.`,
    en: `At EMI we are aware that everyone learns at their own pace.\n That’s why this <strong>is a free and official platform from Secretaría de Educación Pública.</strong>\n It is designed for you to strengthen, revise, and practise your English <strong>anytime and anyplace</strong> with resources adapted to you.`
  },

  parrafo2_main: {
    es: `Aquí encontrarás <strong>Recursos Educativos Digitales (RED)</strong><br>diseñados para impulsar tu aprendizaje.`,
    en: `Here you will find <strong>Digital Educational Resources (RED)</strong><br> designed to boost your English learning.`
  },

  parrafo2_col1: {
    es: `Materiales para reforzar:`,
    en: `Materials for reinforcement:`
  },
  parrafo2_col2: {
    es: `Organizados por habilidades:`,
    en: `Organized by skills:`
  },

  parrafo3: {
    es: `Aprende y pásala cool en nuestras redes. Síguenos y continúa practicando tu inglés.`,
    en: `<strong>Learn and have a blast in our socials. Follow us</strong> and keep practicing your English.`
  },

  parrafo_download: {
    es: `Descárgalos, compártelos y consúltalos cuando quieras… ¡las veces que necesites!`,
    en: `Download, share, and refer to them whenever you want… as many times as you wish!`
  },
  cursos_h2: {
    es: `<strong>Encuentra el curso perfecto para tu nivel</strong>`,
    en: `<strong>Find the course that fits you best.</strong>`
  },
  cursos_parrafo: {
    es: `Cada etapa es una oportunidad: refuerza lo que ya sabes, enfrenta nuevos retos y avanza con confianza en tu inglés.`,
    en: `Every stage is a chance to build on what you know, take on new challenges, and move forward with confidence in your English.`
  }
};

window.toggleTranslation = function (baseId) {
  if (!baseId) return;

    if (baseId === 'parrafo2') {
        const mainSpan = document.getElementById('parrafo2-main-txt');
        const h1 = document.getElementById('parrafo2_col1');
        const h2 = document.getElementById('parrafo2_col2');
        const downloadSpan = document.getElementById('parrafo_download-txt');

        const currentLang = (mainSpan && mainSpan.dataset.lang) ? mainSpan.dataset.lang : 'es';
        const target = currentLang === 'en' ? 'es' : 'en';

        if (mainSpan && translations.parrafo2_main) {
            mainSpan.innerHTML = translations.parrafo2_main[target];
            mainSpan.dataset.lang = target;
        }
        if (h1 && translations.parrafo2_col1) {
            h1.innerHTML = translations.parrafo2_col1[target];
            h1.dataset.lang = target;
        }
        if (h2 && translations.parrafo2_col2) {
            h2.innerHTML = translations.parrafo2_col2[target];
            h2.dataset.lang = target;
        }
        // Traducir también el banner de descarga
        if (downloadSpan && translations.parrafo_download) {
            downloadSpan.innerHTML = translations.parrafo_download[target];
            downloadSpan.dataset.lang = target;
        }
        return;
    }

  // When toggling the cursos paragraph, also toggle the H2 title so they stay in the same language
  if (baseId === 'cursos_parrafo') {
    const span = document.getElementById('cursos_parrafo-txt');
    const h2 = document.getElementById('cursos_h2-txt');
    if (!span || !translations.cursos_parrafo) return;
    const current = (span.dataset.lang || 'es');
    const target = current === 'en' ? 'es' : 'en';
    span.innerHTML = translations.cursos_parrafo[target];
    span.dataset.lang = target;
    if (h2 && translations.cursos_h2) {
      h2.innerHTML = translations.cursos_h2[target];
      h2.dataset.lang = target;
    }
    return;
  }

  const span = document.getElementById(baseId + '-txt');
  if (!span || !translations[baseId]) return;
  const current = (span.dataset.lang || 'es');
  const target = current === 'en' ? 'es' : 'en';
  span.innerHTML = translations[baseId][target];
  span.dataset.lang = target;
};
//recursos
document.addEventListener('DOMContentLoaded', function() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const dynamicCarousel = document.getElementById('dynamicCarousel');

    const fallbackImg = (dynamicCarousel && dynamicCarousel.dataset && dynamicCarousel.dataset.fallback) ? dynamicCarousel.dataset.fallback : '/static/images/default-course.jpg';

    const API_URLS = {
        'A1': 'https://nuevaescuelamexicana.sep.gob.mx/api/contenido/coleccion/?alineador=A&page=1',
        'A2': 'https://nuevaescuelamexicana.sep.gob.mx/api/contenido/coleccion/?alineador=A2&page=1',
        'B1': 'https://nuevaescuelamexicana.sep.gob.mx/api/contenido/coleccion/?alineador=B1&page=1'
    };

    async function loadData() {
        try {
            showLoading();
            await loadAllContent();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            showError('Error general: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    async function loadAllContent() {
        try {
            showLoading();
            const allContent = [];
            
            // Cargar contenido de todos los niveles
            for (const level of Object.keys(API_URLS)) {
                try {
                    const response = await fetch(API_URLS[level]);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            allContent.push(...data);
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar contenido del nivel ' + level + ':', error);
                }
            }
            
            if (allContent.length === 0) {
                showError('No se encontraron recursos');
                return;
            }
            
            generateCarousel(allContent);
        } catch (error) {
            console.error('Error al cargar contenido:', error);
            showError('Error al cargar contenido: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    function generateCarousel(content) {
        if (!dynamicCarousel) return;
        if (!content || content.length === 0) {
            showError('No hay contenido disponible');
            return;
        }

        dynamicCarousel.innerHTML = '';

        // Crear el contenedor principal del carrusel
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';
        
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel-wrapper';
        
        const carouselTrack = document.createElement('div');
        carouselTrack.className = 'carousel-track';
        
        // Tomar solo los primeros 9 elementos para tener 3 de cada nivel (A1, A2, B1)
        const limitedContent = content.slice(0, 9);
        
        limitedContent.forEach(function(item, i) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'carousel-card';
            cardDiv.style.cursor = 'pointer';
            cardDiv.setAttribute('data-item-id', (item.id || '') + '-' + i);

            cardDiv.addEventListener('click', function() {
                openResource(item.id, item.nombre);
            });

            const imgEl = document.createElement('img');
            imgEl.className = 'carousel-image';
            imgEl.loading = 'lazy';
            imgEl.alt = item.nombre || 'Recurso';
            imgEl.src = item.portada || fallbackImg;
            imgEl.onerror = function() { this.src = fallbackImg; };

            cardDiv.appendChild(imgEl);
            carouselTrack.appendChild(cardDiv);
        });

        // Siempre agregar botones de navegación si hay más de 1 elemento
        if (limitedContent.length > 1) {
            // Botones de navegación
            const prevBtn = document.createElement('button');
            prevBtn.className = 'carousel-btn carousel-btn-prev';
            prevBtn.innerHTML = '<i class="bi bi-chevron-left" style="font-size:40px !important;"></i>';
            prevBtn.setAttribute('aria-label', 'Anterior');

            const nextBtn = document.createElement('button');
            nextBtn.className = 'carousel-btn carousel-btn-next';
            nextBtn.innerHTML = '<i class="bi bi-chevron-right" style="font-size:40px !important;"></i>';
            nextBtn.setAttribute('aria-label', 'Siguiente');

            carouselContainer.appendChild(prevBtn);
            carouselContainer.appendChild(nextBtn);
        }

        carouselWrapper.appendChild(carouselTrack);
        carouselContainer.appendChild(carouselWrapper);
        dynamicCarousel.appendChild(carouselContainer);

        // Inicializar navegación DESPUÉS de insertar en el DOM
        if (limitedContent.length > 1) {
            const prevBtn = carouselContainer.querySelector('.carousel-btn-prev');
            const nextBtn = carouselContainer.querySelector('.carousel-btn-next');
            initCarouselNavigation(carouselTrack, prevBtn, nextBtn, limitedContent.length);
        }
    }

    function initCarouselNavigation(track, prevBtn, nextBtn, totalItems) {
        let currentIndex = 0;
        const cards = track.children;
        
        // Función para obtener el ancho dinámico de las tarjetas y el gap
        function getCardMetrics() {
            if (cards.length === 0) return { cardWidth: 0, gap: 0, visibleItems: 1 };
            
            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const trackStyle = getComputedStyle(track);
            const gap = parseInt(trackStyle.gap) || 0;
            const wrapperWidth = track.parentElement.offsetWidth;
            const visibleItems = Math.max(1, Math.floor((wrapperWidth + gap) / (cardWidth + gap)));
            
            return { cardWidth, gap, visibleItems };
        }
        
        // Posicionar el track en el primer conjunto de tarjetas
        track.style.transform = `translateX(0px)`;
        
        function updateButtons() {
            const { visibleItems } = getCardMetrics();
            const maxIndex = Math.max(0, totalItems - visibleItems);
            // Ocultar flechas si todos los items caben en pantalla
            const needsNav = visibleItems < totalItems;
            prevBtn.style.display = needsNav ? '' : 'none';
            nextBtn.style.display = needsNav ? '' : 'none';
            if (needsNav) {
                prevBtn.style.opacity = currentIndex <= 0 ? '0.3' : '1';
                nextBtn.style.opacity = currentIndex >= maxIndex ? '0.3' : '1';
            }
        }
        
        function moveToIndex(index) {
            const { cardWidth, gap } = getCardMetrics();
            const moveDistance = cardWidth + gap;
            const offset = -index * moveDistance;
            track.style.transform = `translateX(${offset}px)`;
            updateButtons();
        }

        function nextSlide() {
            const { visibleItems } = getCardMetrics();
            const maxIndex = Math.max(0, totalItems - visibleItems);
            
            if (currentIndex < maxIndex) {
                currentIndex++;
                moveToIndex(currentIndex);
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                moveToIndex(currentIndex);
            }
        }
        
        // Estado inicial de botones
        updateButtons();

        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Soporte táctil para móviles
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            
            isDragging = false;
        });

        // Redimensionar ventana
        window.addEventListener('resize', () => {
            const { visibleItems } = getCardMetrics();
            const maxIndex = Math.max(0, totalItems - visibleItems);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            moveToIndex(currentIndex);
        });
    }

    function showError(message) {
        if (!dynamicCarousel) return;
        dynamicCarousel.innerHTML = 
            '<div class="row">' +
                '<div class="col-md-12">' +
                    '<div class="alert alert-warning text-dark" role="alert">' +
                        '<h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Información</h4>' +
                        '<p class="mb-0">' + message + '</p>' +
                        '<hr>' +
                        '<p class="mb-0">Esto puede deberse a que el nivel seleccionado aún no tiene contenido disponible. Intenta con otro nivel.</p>' +
                        '<p class="mb-0">' +
                            '<button class="btn btn-outline-primary btn-sm" onclick="location.reload()">' +
                                '<i class="bi bi-arrow-clockwise"></i> Recargar página' +
                            '</button>' +
                        '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function showLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
    }

    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    window.openResource = function(resourceId, resourceName) {
        const parts = (resourceName || '').split('. ');
        if (parts.length >= 2) {
            const nivel = parts[0].toLowerCase();
            const recurso = parts[1].toLowerCase();
            window.location.href = '/jobs?nivel=' + nivel + '&recurso=' + recurso + '&id=' + resourceId;
        } else {
            window.location.href = '/jobs';
        }
    };

    loadData();
});
