/* ========================================
   HEPHAUTO - MAIN JAVASCRIPT FILE
   ========================================
   This is the primary JavaScript file for the HephAuto automotive dealership website.
   Handles all interactive functionality including:
   - Navigation and mobile menu
   - Search functionality
   - Product filtering and display
   - Image galleries and modals
   - Chat functionality
   - Form validation
   - User authentication
   - Responsive interactions
   ======================================== */

// Placeholder inventory data for search functionality
// Contains sample product data for demonstration purposes
const inventoryProducts = [
  { id: 1, name: 'Truck Model A', category: 'Trucks', description: 'Heavy duty truck' },
  { id: 2, name: 'Sedan XYZ', category: 'Cars', description: 'Efficient family car' },
  { id: 3, name: 'SUV Pro', category: 'SUVs', description: 'Spacious and powerful SUV' },
  { id: 4, name: 'Truck Model B', category: 'Trucks', description: 'Medium duty truck' },
  { id: 5, name: 'Electric Car 2024', category: 'Electric', description: 'Eco-friendly electric car' },
];

/* ===== NAVIGATION SCROLL EFFECTS ===== */
/* Handles navbar appearance changes based on scroll position */
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0; // Track previous scroll position
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class for styling changes when user scrolls down
      if (scrollTop > 50) {
        navbar.classList.add('scrolled'); // Triggers CSS changes for scrolled state
      } else {
        navbar.classList.remove('scrolled'); // Returns to default state
      }
      
      // Hide/show navbar on scroll for better UX
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide navbar to save space
        navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up - show navbar for easy navigation
        navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop; // Update last scroll position
    }, { passive: true });
  }
});

/* ===== DYNAMIC SEARCH PLACEHOLDER ===== */
/* Cycles through different search options to guide users */
function initializeDynamicPlaceholders() {
  const placeholders = [
    "Search by type...",
    "Search by make...", 
    "Search by model...",
    "Search by fuel type..."
  ];
  
  let currentIndex = 0;
  
  function updatePlaceholders() {
    const searchInputs = [
      document.getElementById("searchInput"),
      document.getElementById("search-input"),
      document.getElementById("mobileMenuSearchInput"),
      document.getElementById("userSearch")
    ].filter(Boolean);
    
    searchInputs.forEach(input => {
      if (input && !input.value) { // Only update if input is empty
        input.placeholder = placeholders[currentIndex];
      }
    });
    
    currentIndex = (currentIndex + 1) % placeholders.length;
  }
  
  // Update placeholders every 1 second
  setInterval(updatePlaceholders, 2000);
  
  // Initial update
  updatePlaceholders();
}

// ===== MOBILE BOTTOM NAVIGATION HIDE/SHOW ON SCROLL =====
document.addEventListener('DOMContentLoaded', function() {
  const mobileNav = document.querySelector('.mobile-bottom-nav');
  if (!mobileNav) return;
  let lastScrollY = window.scrollY;
  let ticking = false;
  let navHidden = false;
  let showTimeout = null;

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function hideNav() {
    if (!navHidden) {
      mobileNav.classList.add('hide-on-scroll');
      mobileNav.classList.remove('show-on-scroll');
      navHidden = true;
    }
  }
  function showNav() {
    if (navHidden) {
      mobileNav.classList.remove('hide-on-scroll');
      mobileNav.classList.add('show-on-scroll');
      navHidden = false;
    }
  }

  function onScroll() {
    if (!isMobile()) return;
    if (window.scrollY > lastScrollY + 10) {
      hideNav();
    } else if (window.scrollY < lastScrollY - 10) {
      showNav();
    }
    lastScrollY = window.scrollY;
  }

  function onTouchOrMove() {
    if (!isMobile()) return;
    showNav();
    if (showTimeout) clearTimeout(showTimeout);
    showTimeout = setTimeout(() => {
      hideNav();
    }, 2200);
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  // Show nav on touch or pointer interaction
  ['touchstart','mousemove','pointerdown'].forEach(evt => {
    window.addEventListener(evt, onTouchOrMove, {passive:true});
  });

  // Always show nav on resize to desktop
  window.addEventListener('resize', function() {
    if (!isMobile()) {
      mobileNav.classList.remove('hide-on-scroll','show-on-scroll');
      navHidden = false;
    }
  });
});

/* ===== SEARCH FUNCTIONALITY ===== */
/* Handles product search across all pages with real-time filtering */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dynamic placeholders
  initializeDynamicPlaceholders();
  
  // Handle all search inputs across the site
  // Supports multiple search input IDs for different pages
  const searchInputs = [
    document.getElementById("searchInput"), // Main search input
    document.getElementById("search-input") // Alternative search input
  ].filter(Boolean); // Remove null values to avoid errors

  const searchIcons = document.querySelectorAll('.search-icon'); // Search icon elements
  const productCardsContainer = document.querySelector('.product-cards-container'); // Container for product cards
  const productCards = document.querySelectorAll('.product-card'); // All product card elements

  /* ===== HELPER FUNCTIONS ===== */
  // Normalize text for consistent search matching
  function normalize(str) {
    return str.toLowerCase().replace(/\s+/g, ' ').trim(); // Convert to lowercase, normalize spaces
  }

  // Debounce function to limit how often a function can be called
  // Useful for search input to avoid excessive API calls or filtering
  function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId); // Clear previous timeout
      timeoutId = setTimeout(() => {
        func.apply(this, args); // Execute function after delay
      }, delay);
    };
  }

  // Check if current page is a buy page
  function isBuyPage() {
    const path = window.location.pathname;
    return path.includes('buy.html') || path.includes('productshow.html');
  }

  // Check if current page is the homepage
  function isHomePage() {
    const path = window.location.pathname;
    return path.endsWith('Heph.html') || path === '/' || path === '';
  }

  // Redirect to buy page with search query in URL
  function redirectToBuyWithSearch(query) {
    if (query.trim()) {
      const encodedQuery = encodeURIComponent(query.trim()); // Encode for URL safety
      // Clear all search inputs before redirecting
      searchInputs.forEach(searchInput => {
        if (searchInput) {
          searchInput.value = '';
        }
      });
      window.location.href = `buy.html?search=${encodedQuery}`;
    } else {
      window.location.href = 'buy.html'; // Redirect without search if empty
    }
  }

  // Handle search functionality for buy page
  if (isBuyPage() && productCards.length > 0) {
    const searchInput = searchInputs[0]; // Use the first search input
    if (searchInput) {
      // Create or get the no-results message
      let noResultsMsg = document.getElementById('noResultsMsg');
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'noResultsMsg';
        noResultsMsg.textContent = 'No products found.';
        noResultsMsg.style.display = 'none';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.padding = '60px 0';
        noResultsMsg.style.fontSize = '1.3rem';
        noResultsMsg.style.color = '#888';
        if (productCardsContainer && productCardsContainer.parentNode) {
          productCardsContainer.parentNode.insertBefore(noResultsMsg, productCardsContainer.nextSibling);
        }
      }

             function filterBuy() {
         const query = normalize(searchInput.value);
         let visibleCount = 0;
         
         // Always get the latest product cards
         const productCards = document.querySelectorAll('.product-card');
         productCards.forEach(card => {
           // Gather searchable text from the card
           const name = card.querySelector('h3')?.textContent || '';
           const location = card.querySelector('.location')?.textContent || '';
           const status = card.querySelector('.status')?.textContent || '';
           const details = card.querySelector('.details')?.textContent || '';
           const searchable = normalize(name + ' ' + location + ' ' + status + ' ' + details);
           
           if (searchable.includes(query)) {
             card.style.display = '';
             visibleCount++;
           } else {
             card.style.display = 'none';
           }
         });
         
         // Center if only one or a few results
         if (visibleCount > 0 && visibleCount <= 2) {
           productCardsContainer.classList.add('center-results');
         } else {
           productCardsContainer.classList.remove('center-results');
         }
         
         // Center container and show/hide no results
         if (productCardsContainer) {
           productCardsContainer.style.justifyContent = 'center';
           productCardsContainer.style.margin = '0 auto';
           productCardsContainer.style.padding = '40px 20px';
           productCardsContainer.style.display = 'grid';
         }
         
         if (noResultsMsg) {
           noResultsMsg.style.display = visibleCount > 0 ? 'none' : 'block';
           if (visibleCount === 0) {
             setTimeout(() => {
               if (document.referrer) {
                 window.location.href = document.referrer;
               } else {
                 window.location.href = 'Heph.html';
               }
             }, 1500); // Show message for 1.5 seconds before redirect
           }
         }

         // Show/hide search results indicator
         if (searchResultsIndicator && searchResultsText) {
           if (query.trim()) {
             searchResultsIndicator.style.display = 'block';
             searchResultsText.textContent = `Search Results for "${query}" (${visibleCount} found)`;
           } else {
             searchResultsIndicator.style.display = 'none';
           }
         }
       }

             // Search results indicator
       const searchResultsIndicator = document.getElementById('searchResultsIndicator');
       const searchResultsText = document.getElementById('searchResultsText');
       const clearSearchBtn = document.getElementById('clearSearchBtn');

       // If a search query is present in the URL, use it
       const urlParams = new URLSearchParams(window.location.search);
       const urlSearch = urlParams.get('search');
       if (urlSearch) {
         searchInput.value = urlSearch;
         filterBuy();
         // Show search results indicator
         if (searchResultsIndicator && searchResultsText) {
           searchResultsIndicator.style.display = 'block';
           searchResultsText.textContent = `Search Results for "${urlSearch}"`;
         }
       }

       // Clear search functionality
       if (clearSearchBtn) {
         clearSearchBtn.addEventListener('click', () => {
           searchInput.value = '';
           filterBuy();
           if (searchResultsIndicator) {
             searchResultsIndicator.style.display = 'none';
           }
           // Remove search parameter from URL
           const newUrl = window.location.pathname;
           window.history.replaceState({}, document.title, newUrl);
         });
       }

      const debouncedFilter = debounce(filterBuy, 300);

      // Live search as you type (debounced)
      searchInput.addEventListener('input', debouncedFilter);

      // Search on Enter key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          filterBuy();
        }
      });
    }
  }

  // Handle search functionality for non-buy pages (redirect to buy)
  if (!isBuyPage()) {
    searchInputs.forEach(searchInput => {
      if (searchInput) {
        // Search on Enter key
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            redirectToBuyWithSearch(searchInput.value);
          }
        });

                 // Search on input change (with debounce for better UX)
         const debouncedRedirect = debounce((value) => {
           if (value.trim().length > 2) { // Only redirect if query is longer than 2 characters
             // Add a small visual feedback
             const searchIcon = searchInput.parentElement.querySelector('.search-icon');
             if (searchIcon) {
               searchIcon.style.transform = 'scale(1.1)';
               searchIcon.style.color = '#4291e0';
               setTimeout(() => {
                 searchIcon.style.transform = 'scale(1)';
                 searchIcon.style.color = '';
               }, 200);
             }
             redirectToBuyWithSearch(value);
           }
         }, 800);

         searchInput.addEventListener('input', (e) => {
           debouncedRedirect(e.target.value);
         });
      }
    });

    // Handle search icon clicks
    searchIcons.forEach(searchIcon => {
      searchIcon.addEventListener('click', () => {
        const searchInput = searchIcon.parentElement.querySelector('input[type="text"]');
        if (searchInput) {
          redirectToBuyWithSearch(searchInput.value);
        }
      });
    });

    // Add keyboard navigation support for search
    document.addEventListener('keydown', (e) => {
      // Escape key to clear search
      if (e.key === 'Escape') {
        searchInputs.forEach(searchInput => {
          if (searchInput && searchInput.value) {
            searchInput.value = '';
            // Trigger any active search to clear results
            if (isBuyPage()) {
              filterBuy();
            }
          }
        });
      }
      
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const firstSearchInput = searchInputs[0];
        if (firstSearchInput) {
          firstSearchInput.focus();
        }
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// ===== MOBILE MENU AND OVERLAY SCRIPT =====
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenuBtn = document.getElementById("closeMenu");
  const overlay = document.getElementById("mobileMenuOverlay");

  const openMenu = () => {
    if (mobileMenu) mobileMenu.classList.add("open");
    if (overlay) overlay.classList.add("show");
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if (mobileMenu) mobileMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = 'auto';
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", openMenu);
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", closeMenu);
  }
  
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // Auto-close mobile menu when screen size changes to desktop/laptop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
});

// Dropdown functionality
document.addEventListener("DOMContentLoaded", () => {
  // Modal elements and state
  const imageViewModal = document.getElementById('imageViewModal');
  const modalImage = document.getElementById('modalImage');
  const closeImageViewModal = document.getElementById('closeImageViewModal');
  const modalArrowLeft = document.getElementById('modalArrowLeft');
  const modalArrowRight = document.getElementById('modalArrowRight');
  let modalImages = [];
  let modalCurrentIndex = 0;

  // Function to navigate modal images
  function showModalImage(index) {
    if (!modalImages.length) return;
    modalCurrentIndex = (index + modalImages.length) % modalImages.length;
    modalImage.src = modalImages[modalCurrentIndex];
  }

  // Setup modal navigation events only once
  if (modalArrowLeft && modalArrowRight) {
    modalArrowLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      showModalImage(modalCurrentIndex - 1);
    });
    modalArrowRight.addEventListener('click', (e) => {
      e.stopPropagation();
      showModalImage(modalCurrentIndex + 1);
    });
    modalImage.addEventListener('click', (e) => {
      e.stopPropagation();
      showModalImage(modalCurrentIndex + 1);
    });
  }
  
  // Setup keyboard navigation for the modal
  document.addEventListener('keydown', (e) => {
    if (imageViewModal.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') {
      showModalImage(modalCurrentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      showModalImage(modalCurrentIndex - 1);
    } else if (e.key === 'Escape') {
      imageViewModal.style.display = 'none';
    }
  });


  // Close modal events
  closeImageViewModal.addEventListener('click', () => {
    imageViewModal.style.display = 'none';
  });

  imageViewModal.addEventListener('click', (e) => {
    if (e.target === imageViewModal) {
      imageViewModal.style.display = 'none';
    }
  });

  document.querySelectorAll('.product-card').forEach(card => {
    const images = card.dataset.images.split(',');
    if (images.length > 10) {
      console.warn('More than 10 images detected. Only the first 10 will be displayed.');
      images.length = 10;
    }
    
    const imageGallery = card.querySelector('.image-gallery');
    const dotsContainer = card.querySelector('.card-navigation-dots');
    let currentImageIndex = 0;
    
    // Touch variables for swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    // Create and append images and dots
    images.forEach((src, index) => {
      const img = document.createElement('img');
      if (index === 0) {
        img.src = src.trim();
        img.classList.add('active');
      } else {
        // Defer loading of non-visible gallery images until interaction
        img.dataset.src = src.trim();
        img.setAttribute('loading', 'lazy');
      }
      img.alt = 'Product Image';
      img.classList.add('product-image');
      imageGallery.appendChild(img);

      // Open modal on image click
      img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalImages = images.map(s => s.trim());
        showModalImage(index);
        imageViewModal.style.display = 'flex';
      });

      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showCardImage(index));
      dotsContainer.appendChild(dot);
    });

    // Add view (eye) icon overlay
    const viewIcon = document.createElement('span');
    viewIcon.className = 'view-image-icon';
    viewIcon.innerHTML = '<i class="fas fa-expand"></i>';
    imageGallery.appendChild(viewIcon);
    viewIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      modalImages = images.map(s => s.trim());
      showModalImage(currentImageIndex);
      imageViewModal.style.display = 'flex';
    });
    
    // Swipe and drag functionality for card images
    imageGallery.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isDragging = true;
    }, { passive: true });

    imageGallery.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      isDragging = false;
    }, { passive: true });
    
    imageGallery.addEventListener('mousedown', (e) => {
      touchStartX = e.clientX;
      isDragging = true;
      imageGallery.style.cursor = 'grabbing';
    });

    imageGallery.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      touchEndX = e.clientX;
      handleSwipe();
      isDragging = false;
      imageGallery.style.cursor = 'grab';
    });

    // Prevent default drag behavior
    imageGallery.addEventListener('dragstart', (e) => e.preventDefault());

    function handleSwipe() {
      const swipeThreshold = 50;
      if (Math.abs(touchEndX - touchStartX) > swipeThreshold) {
        if (touchEndX > touchStartX) {
          showCardImage(currentImageIndex - 1);
        } else {
          showCardImage(currentImageIndex + 1);
        }
      }
    }

    function showCardImage(index) {
      const allImages = imageGallery.querySelectorAll('.product-image');
      const allDots = dotsContainer.querySelectorAll('.dot');
      currentImageIndex = (index + images.length) % images.length;
      
      // Lazy-load target image on demand
      const targetImg = allImages[currentImageIndex];
      if (targetImg && targetImg.dataset.src) {
        targetImg.src = targetImg.dataset.src;
        targetImg.removeAttribute('data-src');
      }
      
      allImages.forEach((img, i) => img.classList.toggle('active', i === currentImageIndex));
      allDots.forEach((dot, i) => dot.classList.toggle('active', i === currentImageIndex));
    }

    imageGallery.style.cursor = 'grab';
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // All product images in galleries
  document.querySelectorAll('.product-image').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Modal image
  const modalImage = document.getElementById('modalImage');
  if (modalImage) {
    modalImage.addEventListener('contextmenu', e => e.preventDefault());
    modalImage.addEventListener('dragstart', e => e.preventDefault());
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('.nav-links .dropdown-link .dropdown');
  navLinks.forEach(link => {
    if (link.textContent.trim() === "Products") {
      link.parentElement.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('buy.html', '_blank');
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
    // Event delegation for action buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;
        
        // Find parent product card
        const productCard = button.closest('.product-card');
        if (!productCard) return;

        e.preventDefault();
        e.stopPropagation();
        
        if (button.classList.contains('like-btn') || button.classList.contains('bookmark-btn')) {
            button.classList.toggle('active');
            const icon = button.querySelector('i');
            
            // Toggle between 'far' (regular) and 'fas' (solid) icons
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        } else if (button.classList.contains('message-btn')) {
            // Get product information from the card
            const productName = (productCard.querySelector('h3') || {}).textContent || 'Vehicle';
            const productPrice = (productCard.querySelector('h1') || {}).textContent || 'Contact for Price';
            const sellerName = "HephAuto Seller";
            
            // Extract the first image of this card
            const imagesAttr = productCard.getAttribute('data-images') || '';
            let productImage = imagesAttr.split(',')[0] || '';
            if (!productImage) {
                const imgEl = productCard.querySelector('img');
                if (imgEl) productImage = imgEl.getAttribute('src') || '';
            }
            if (!productImage) productImage = 'assets/assets1/coasterbus.jpg'; // fallback

            // Create a realistic message from buyer to seller
            const message = `Hi! I'm interested in your ${productName.trim()} listed for ${productPrice.trim()}. Could you please provide more details about the vehicle's condition, mileage, and availability? Also, is the price negotiable? Thank you!`;
            
            // Create modal backdrop and modal HTML
            const backdrop = document.createElement('div');
            backdrop.className = 'heph-modal-backdrop';
            
            backdrop.innerHTML = `
                <div class="heph-message-modal">
                    <div class="heph-message-modal-header">
                        <h3>Message from HephAuto Seller</h3>
                        <button class="heph-message-modal-close-x">&times;</button>
                    </div>
                    <div class="heph-message-modal-bubble">
                        <p>${message}</p>
                    </div>
                    <div class="heph-message-modal-actions">
                        <button class="heph-message-modal-btn close-btn">Close</button>
                        <button class="heph-message-modal-btn reply-btn">Reply</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(backdrop);
            
            // Trigger transition
            requestAnimationFrame(() => {
                backdrop.classList.add('show');
            });
            
            // Function to close modal smoothly
            const closeModal = () => {
                backdrop.classList.remove('show');
                backdrop.addEventListener('transitionend', () => {
                    backdrop.remove();
                }, { once: true });
                // Fallback remove if transitionend is not fired
                setTimeout(() => {
                    if (backdrop.parentNode) backdrop.remove();
                }, 400);
            };
            
            // Close event listeners
            backdrop.querySelector('.heph-message-modal-close-x').addEventListener('click', closeModal);
            backdrop.querySelector('.close-btn').addEventListener('click', closeModal);
            backdrop.addEventListener('click', (ev) => {
                if (ev.target === backdrop) closeModal();
            });
            
            // Reply event listener
            backdrop.querySelector('.reply-btn').addEventListener('click', () => {
                // Save conversation details to localStorage.heph_conversations
                const conversation = {
                    id: `${sellerName}-${productName.trim()}`,
                    sellerName: sellerName,
                    vehicleName: productName.trim(),
                    price: productPrice.trim(),
                    image: productImage.trim(),
                    lastMessage: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: false
                };

                let conversations = JSON.parse(localStorage.getItem('heph_conversations') || '[]');
                conversations = conversations.filter(c => c.id !== conversation.id);
                conversations.unshift(conversation);
                localStorage.setItem('heph_conversations', JSON.stringify(conversations));

                // Redirect to chat.html with details
                const redirectUrl = `chat.html?seller=${encodeURIComponent(sellerName)}&product=${encodeURIComponent(productName.trim())}&price=${encodeURIComponent(productPrice.trim())}&image=${encodeURIComponent(productImage.trim())}&message=${encodeURIComponent(message)}`;
                
                backdrop.classList.remove('show');
                setTimeout(() => {
                    backdrop.remove();
                    window.location.href = redirectUrl;
                }, 200);
            });
            
        } else if (button.classList.contains('share-btn')) {
            // Show share options
            if (navigator.share) {
                navigator.share({
                    title: 'Check out this vehicle!',
                    text: 'I found this amazing vehicle on HephAuto',
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const shareUrl = window.location.href;
                navigator.clipboard.writeText(shareUrl).then(() => {
                    if (typeof showHephToast === 'function') {
                        showHephToast('Link copied to clipboard!', 'success');
                    } else {
                        alert('Link copied to clipboard!');
                    }
                }).catch(() => {
                    alert('Link copied to clipboard!');
                });
            }
        }
    });
});

// Image Upload Validation and Handling (Commented for later use)
function validateImageUpload(files) {
  const maxImages = 15;
  const minRecommendedImages = 4;
  
  if (files.length > maxImages) {
    alert(`Maximum ${maxImages} images allowed. Please select fewer images.`);
    return false;
  }
  
  if (files.length < minRecommendedImages) {
    const proceed = confirm(`It's recommended to upload at least ${minRecommendedImages} images for better presentation. Do you want to continue with ${files.length} images?`);
    return proceed;
  }
  
  return true;
}

// Handle Image Upload and Product Card Creation
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById('imageInput');
  const imageUploadForm = document.getElementById('imageUploadForm');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const uploadButton = document.querySelector('.upload-btn');
  const productCardsContainer = document.querySelector('.product-cards-container');

  if (imageInput && imageUploadForm && selectedFilesDiv) {
    // Drag and drop functionality
    const uploadArea = document.querySelector('.file-input-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('highlight');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener('click', () => {
        uploadArea.classList.remove('highlight');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });

    // Handle file selection
    imageInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    function handleFiles(files) {
      const fileArray = Array.from(files);
      
      // Validate number of images
      if (!validateImageUpload(fileArray)) {
        imageInput.value = '';
        selectedFilesDiv.innerHTML = '';
        return;
      }

      // Display selected files
      selectedFilesDiv.innerHTML = fileArray.map((file, index) => `
        <div class="selected-file">
          <span>
            <i class="fas fa-image"></i>
            ${file.name}
          </span>
          <button type="button" onclick="removeFile(${index})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');

      // Update upload button text
      uploadButton.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        ${fileArray.length} ${fileArray.length === 1 ? 'File' : 'Files'} Selected
      `;
    }

    // Handle form submission
    imageUploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const files = Array.from(imageInput.files);
      
      if (!files.length) {
        alert('Please select images to upload.');
        return;
      }

      if (!validateImageUpload(files)) {
        return;
      }

      try {
        // Get form data
        const productData = {
          name: document.getElementById('vehicleName')?.value || 'New Product',
          price: document.getElementById('vehiclePrice')?.value || 'Price on Request',
          location: document.getElementById('vehicleLocation')?.value || 'New Upload',
          status: document.getElementById('vehicleStatus')?.value || 'New',
          features: document.getElementById('vehicleFeatures')?.value || '',
          images: [],
          id: Date.now(), // Unique ID for the product
          uploadDate: new Date().toISOString()
        };

        // Convert files to base64 for storage
        const imagePromises = files.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        });

        productData.images = await Promise.all(imagePromises);

        // Save to localStorage
        const existingProducts = JSON.parse(localStorage.getItem('uploadedProducts') || '[]');
        existingProducts.push(productData);
        localStorage.setItem('uploadedProducts', JSON.stringify(existingProducts));

        // Create product card with selected images
        const newCard = createProductCard(files);
        
        // Set the product ID in the card's dataset for deletion
        newCard.dataset.productId = productData.id;
        
        // Add the new card to the container
        if (productCardsContainer) {
          if (productCardsContainer.children.length === 0) {
            productCardsContainer.appendChild(newCard);
          } else {
            productCardsContainer.insertBefore(newCard, productCardsContainer.firstChild);
          }
        }

        // Reset form
        imageUploadForm.reset();
        selectedFilesDiv.innerHTML = '';
        uploadButton.innerHTML = `
          <i class="fas fa-cloud-upload-alt"></i>
          Click to Select Images
        `;

        alert('Product uploaded successfully and saved to database!');
      } catch (error) {
        console.error('Error creating product card:', error);
        alert('Error creating product card. Please try again.');
      }
    });
  }
});

// Function to create a new product card
function createProductCard(files) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // Convert File objects to URLs and filter out any empty entries
  const imageUrls = files.map(file => URL.createObjectURL(file)).filter(url => url && url.trim() !== '');
  card.dataset.images = imageUrls.join(',');

  // Get details from the form
  const name = document.getElementById('vehicleName')?.value || 'New Product';
  const price = document.getElementById('vehiclePrice')?.value || 'Price on Request';
  const location = document.getElementById('vehicleLocation')?.value || 'New Upload';
  const status = document.getElementById('vehicleStatus')?.value || 'New';
  const features = document.getElementById('vehicleFeatures')?.value || '';
  const featuresList = features.split(',').map(f => f.trim()).filter(f => f);

  // Create card structure
  card.innerHTML = `
    <div class="image-gallery">
      <div class="view-image-icon">
        <i class="fas fa-expand"></i>
      </div>
      <div class="delete-product-icon" title="Delete Product">
        <i class="fas fa-times"></i>
      </div>
    </div>
    <div class="card-navigation-dots"></div>
    <div class="product-info">
      <div class="product-info-top">
        <span class="location"><i class="fas fa-map-marker-alt"></i> ${location}</span>
        <div class="card-actions">
          <button class="action-btn message-btn"><i class="far fa-comment-dots"></i></button>
          <button class="action-btn like-btn"><i class="far fa-heart"></i></button>
          <button class="action-btn bookmark-btn"><i class="far fa-bookmark"></i></button>
          <button class="action-btn share-btn"><i class="far fa-paper-plane"></i></button>
        </div>
      </div>
      <span class="status for-sale">${status}</span>
      <h3>${name}</h3>
      <h1>${price}</h1>
      <div class="details">
        ${featuresList.map(f => `<span><i class='fas fa-check'></i> ${f}</span>`).join('')}
        <a href="#" class="buy-now-btn">View Details</a>
      </div>
    </div>
  `;

  // Initialize the image gallery for the new card
  initializeGallery(card);

  // Add delete functionality for newly created cards
  const deleteIcon = card.querySelector('.delete-product-icon');
  if (deleteIcon) {
    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      // Get the product ID from the card's dataset
      const productId = parseInt(card.dataset.productId);
      if (productId) {
        deleteProduct(productId, card);
      }
    });
  }

  return card;
}

// Function to initialize gallery for a card
function initializeGallery(card) {
  // Filter out empty or whitespace-only image entries
  const images = card.dataset.images.split(',').map(src => src.trim()).filter(src => src !== '');
  const imageGallery = card.querySelector('.image-gallery');
  const dotsContainer = card.querySelector('.card-navigation-dots');
  let currentImageIndex = 0;
  
  // Touch variables for swipe
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;

  // Create and append images
  images.forEach((src, index) => {
    const img = document.createElement('img');
    if (index === 0) {
      img.src = src;
      img.classList.add('active');
    } else {
      // Defer loading of non-visible gallery images until interaction
      img.dataset.src = src;
      img.setAttribute('loading', 'lazy');
    }
    img.alt = 'Product Image';
    img.classList.add('product-image');
    imageGallery.appendChild(img);

    // Open modal on image click
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModalWithImages(images, index);
    });

    // Create navigation dot
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showCardImage(index));
    dotsContainer.appendChild(dot);
  });

  // Add view (eye) icon overlay
  const viewIcon = card.querySelector('.view-image-icon');
  if (viewIcon) {
    viewIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      openModalWithImages(images, currentImageIndex);
    });
  }
  
  // Swipe and drag functionality for card images
  imageGallery.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isDragging = true;
  }, { passive: true });

  imageGallery.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    isDragging = false;
  }, { passive: true });
  
  imageGallery.addEventListener('mousedown', (e) => {
    touchStartX = e.clientX;
    isDragging = true;
    imageGallery.style.cursor = 'grabbing';
  });

  imageGallery.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    touchEndX = e.clientX;
    handleSwipe();
    isDragging = false;
    imageGallery.style.cursor = 'grab';
  });

  // Prevent default drag behavior
  imageGallery.addEventListener('dragstart', (e) => e.preventDefault());

  function handleSwipe() {
    const swipeThreshold = 50;
    if (Math.abs(touchEndX - touchStartX) > swipeThreshold) {
      if (touchEndX > touchStartX) {
        showCardImage(currentImageIndex - 1);
      } else {
        showCardImage(currentImageIndex + 1);
      }
    }
  }

  function showCardImage(index) {
    const allImages = imageGallery.querySelectorAll('.product-image');
    const allDots = dotsContainer.querySelectorAll('.dot');
    currentImageIndex = (index + images.length) % images.length;
    
    // Lazy-load target image on demand
    const targetImg = allImages[currentImageIndex];
    if (targetImg && targetImg.dataset.src) {
      targetImg.src = targetImg.dataset.src;
      targetImg.removeAttribute('data-src');
    }
    
    allImages.forEach((img, i) => img.classList.toggle('active', i === currentImageIndex));
    allDots.forEach((dot, i) => dot.classList.toggle('active', i === currentImageIndex));
  }

  imageGallery.style.cursor = 'grab';
}

// Function to open modal with navigation support
function openModalWithImages(images, startIndex) {
  const imageViewModal = document.getElementById('imageViewModal');
  const modalImage = document.getElementById('modalImage');
  const modalArrowLeft = document.getElementById('modalArrowLeft');
  const modalArrowRight = document.getElementById('modalArrowRight');
  
  if (!imageViewModal || !modalImage) return;
  
  let modalCurrentIndex = startIndex;
  
  function showModalImage(index) {
    if (!images.length) return;
    modalCurrentIndex = (index + images.length) % images.length;
    modalImage.src = images[modalCurrentIndex];
  }
  
  // Show initial image
  showModalImage(startIndex);
  imageViewModal.style.display = 'flex';
  
  // Setup modal navigation
  if (modalArrowLeft) {
    modalArrowLeft.onclick = (e) => {
      e.stopPropagation();
      showModalImage(modalCurrentIndex - 1);
    };
  }
  
  if (modalArrowRight) {
    modalArrowRight.onclick = (e) => {
      e.stopPropagation();
      showModalImage(modalCurrentIndex + 1);
    };
  }
  
  // Setup keyboard navigation
  const handleKeydown = (e) => {
    if (imageViewModal.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') {
      showModalImage(modalCurrentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      showModalImage(modalCurrentIndex - 1);
    } else if (e.key === 'Escape') {
      imageViewModal.style.display = 'none';
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // Clean up when modal is closed
  const closeModal = () => {
    document.removeEventListener('keydown', handleKeydown);
  };
  
  imageViewModal.addEventListener('click', (e) => {
    if (e.target === imageViewModal) {
      imageViewModal.style.display = 'none';
      closeModal();
    }
  });
  
  const closeImageViewModal = document.getElementById('closeImageViewModal');
  if (closeImageViewModal) {
    closeImageViewModal.onclick = () => {
      imageViewModal.style.display = 'none';
      closeModal();
    };
  }
}

// Function to remove individual files
window.removeFile = function(index) {
  const imageInput = document.getElementById('imageInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const uploadButton = document.querySelector('.upload-btn');
  
  // Convert FileList to Array and remove the file at index
  const files = Array.from(imageInput.files);
  files.splice(index, 1);
  
  // Create new FileList from remaining files
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  imageInput.files = dataTransfer.files;
  
  // Trigger change event to update display
  const event = new Event('change');
  imageInput.dispatchEvent(event);
};

// Floating Chat Functionality
document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById('chatIcon');
  const chatInterface = document.getElementById('chatInterface');
  const closeChat = document.getElementById('closeChat');
  const messageInput = document.getElementById('messageInput');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  const chatBadge = document.querySelector('.chat-badge');

  // Toggle chat interface
  if (chatIcon && chatInterface) {
    chatIcon.addEventListener('click', () => {
      chatInterface.classList.toggle('active');
      // Hide badge when chat is open
      if (chatBadge) {
        chatBadge.style.display = chatInterface.classList.contains('active') ? 'none' : 'flex';
      }
    });
  }

  // Close chat
  if (closeChat && chatInterface) {
    closeChat.addEventListener('click', () => {
      chatInterface.classList.remove('active');
      if (chatBadge) {
        chatBadge.style.display = 'flex';
      }
    });
  }

  // Send message functionality
  if (sendMessage && messageInput && chatMessages) {
    sendMessage.addEventListener('click', sendChatMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  function sendChatMessage() {
    const message = messageInput.value.trim();
    if (message) {
      // Add buyer message
      const buyerMessage = `
        <div class="message buyer-message">
          <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${getCurrentTime()}</span>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', buyerMessage);
      
      // Clear input
      messageInput.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Simulate seller response after 1 second
      setTimeout(() => {
        const botReply = getBotResponse(message);
        const sellerResponse = `
          <div class="message seller-message">
            <div class="message-content">
              <p>${botReply}</p>
              <span class="message-time">${getCurrentTime()}</span>
            </div>
          </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', sellerResponse);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  }

  function getBotResponse(userMsg) {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('hijet') || msg.includes('daihatsu')) {
      return "The Daihatsu Hijet is one of our most popular commercial mini-trucks! It starts around ₦4,000,000, runs on a highly efficient 1.0L engine, and is in excellent foreign-used condition. Would you like to schedule an inspection?";
    }
    if (msg.includes('lambo') || msg.includes('aventador')) {
      return "Ah, the Lamborghini Aventador! A masterpiece. It is a V12 monster pushing 700+ HP. It's featured in our premium showroom for ₦250,000,000. Let us know if you want to book a private viewing.";
    }
    if (msg.includes('g63') || msg.includes('mercedes') || msg.includes('g-wagon') || msg.includes('gwagon')) {
      return "The Mercedes-AMG G63 in our showroom is a 2021 model with only 12,000 miles. It's listed at ₦290,000,000. Let me know if you would like to start the checkout process.";
    }
    if (msg.includes('lexus') || msg.includes('rx350') || msg.includes('rx')) {
      return "We have a stunning 2019 Lexus RX350 with 69,000 miles in pristine condition. It offers a great mix of luxury and reliability. Would you like details on pricing or financing?";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('amount')) {
      return "Our inventory ranges from practical everyday vehicles (starting around ₦4,000,000) to top-tier luxury supercars (up to ₦290,000,000). Let me know which model you have in mind so I can give you the exact pricing!";
    }
    if (msg.includes('test drive') || msg.includes('inspect') || msg.includes('physical') || msg.includes('book')) {
      return "We'd love to schedule a physical inspection or test drive for you! Please go to our Services page, use the 'Book Test Drive' scheduler, or drop your phone number here so we can call you to set a date.";
    }
    if (msg.includes('trade') || msg.includes('exchange') || msg.includes('swap')) {
      return "Yes! We accept trade-ins. We have an integrated Trade-In Estimator on our Services page that calculates your current car's value. You can trade it in towards any vehicle in our inventory.";
    }
    if (msg.includes('location') || msg.includes('office') || msg.includes('where') || msg.includes('address')) {
      return "Our main showroom is located at Plot 12, Automotive Drive, Victoria Island, Lagos. We are open Monday to Saturday from 8:00 AM to 6:00 PM. We'd love to have you visit!";
    }
    if (msg.includes('buy') || msg.includes('checkout') || msg.includes('payment') || msg.includes('purchase')) {
      return "To buy a vehicle, you can click on any car in our 'Buy' catalog, select 'Buy Now' to view specifications, and click 'Proceed to Checkout' to complete the details. You can also contact us directly here!";
    }
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('call') || msg.includes('email')) {
      return "You can contact our sales team at sales@hephauto.com or call us directly at +234 801 234 5678. We are always ready to help!";
    }
    if (msg.includes('services') || msg.includes('maintenance') || msg.includes('repair')) {
      return "HephAuto offers premium vehicle sales, spare parts, trade-in valuations, vehicle maintenance, and physical inspections. Check out our Services page for full details!";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('welcome')) {
      return "Hello! Welcome to HephAuto Customer Support. I am your automated showroom assistant. How can I help you today? Ask me about our cars, pricing, test drives, or trade-in deals!";
    }
    
    // Fallback response
    return "Thanks for asking! As the HephAuto assistant, I can tell you that we offer premium luxury and commercial vehicles, maintenance services, and spare parts. Could you tell me more about what you're looking for, or ask about a specific model (like Hijet, G63, Aventador, or RX350)?";
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
  // Star rating logic
  const starRating = document.getElementById('starRating');
  const starsInput = document.getElementById('testimonialStars');
  let currentRating = 5;

  if (starRating && starsInput) {
    const stars = Array.from(starRating.children);

    function setStars(rating) {
      stars.forEach((star, idx) => {
        if (idx < rating) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
    }

    // Mouseover: highlight up to hovered star
    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => {
          if (i <= idx) s.classList.add('hovered');
          else s.classList.remove('hovered');
        });
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hovered'));
      });
      // Click: set rating
      star.addEventListener('click', () => {
        currentRating = idx + 1;
        starsInput.value = currentRating;
        setStars(currentRating);
      });
    });

    // Mouseleave from the whole starRating: reset to current selection
    starRating.addEventListener('mouseleave', () => {
      setStars(currentRating);
      stars.forEach(s => s.classList.remove('hovered'));
    });

    // Initialize with 5 stars selected
    setStars(currentRating);
  }

  // Testimonial form logic
  const form = document.getElementById('testimonialForm');
  const nameInput = document.getElementById('testimonialName');
  const locationInput = document.getElementById('testimonialLocation');
  const textInput = document.getElementById('testimonialText');
  const grid = document.querySelector('.testimonial-grid');
  const imageInput = document.getElementById('testimonialImage');
  const cancelImage = document.getElementById('cancelImage');

  if (form && grid) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Read the uploaded image (used for both avatar and product photo)
      const file = imageInput.files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        // Create new testimonial card
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
          <div class="testimonial-image-container">
            <img src="${event.target.result}" alt="Product Photo" class="testimonial-user-photo">
            <span class="testimonial-rating"><i class="fas fa-star"></i> ${starsInput.value}</span>
            <img src="${event.target.result}" alt="${nameInput.value}" class="testimonial-avatar" style="position:absolute;left:50%;bottom:-32px;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;border:4px solid #fff;object-fit:cover;background:#fff;z-index:3;">
          </div>
          <div class="testimonial-info" style="margin-top:40px;">
            <h3>${nameInput.value}</h3>
            <span class="testimonial-location">${locationInput.value}</span>
            <p class="testimonial-text">"${textInput.value}"</p>
          </div>
        `;
        grid.appendChild(card);
        form.reset();
        cancelImage.style.display = 'none';
        // Reset stars to 5
        Array.from(starRating.children).forEach((star, idx) => {
          if (idx < 5) star.classList.add('selected');
          else star.classList.remove('selected');
        });
        starsInput.value = 5;
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    });
  }

  if (imageInput && cancelImage) {
    imageInput.addEventListener('change', function() {
      cancelImage.style.display = imageInput.files.length ? 'inline' : 'none';
    });
    cancelImage.addEventListener('click', function() {
      imageInput.value = '';
      cancelImage.style.display = 'none';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const currentlyActive = document.querySelector('.faq-item.active');
      if (currentlyActive && currentlyActive !== item) {
        currentlyActive.classList.remove('active');
        currentlyActive.querySelector('i').classList.replace('fa-minus', 'fa-plus');
      }
      
      item.classList.toggle('active');
      const icon = item.querySelector('i');
      if (item.classList.contains('active')) {
        icon.classList.replace('fa-plus', 'fa-minus');
      } else {
        icon.classList.replace('fa-minus', 'fa-plus');
      }
    });
  });
});

// ===== BACK TO TOP BUTTON LOGIC =====
document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (backToTopBtn) {
    // Show button on scroll
    window.onscroll = function() {
      if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    };

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

// ===== ENHANCED FEATURES FUNCTIONALITY =====

// Animated Counter for Hero Stats
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll('.stat-number');
  
  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current);
    }, 16);
  };
  
  // Intersection Observer for counter animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => {
    observer.observe(counter);
  });
});

// Floating Action Button
document.addEventListener("DOMContentLoaded", () => {
  const fabMain = document.getElementById('fabMain');
  const fabOptions = document.querySelector('.fab-options');
  
  if (fabMain && fabOptions) {
    fabMain.addEventListener('click', () => {
      fabMain.classList.toggle('active');
      fabOptions.classList.toggle('show');
    });
    
    // Close FAB when clicking outside
    document.addEventListener('click', (e) => {
      if (!fabMain.contains(e.target) && !fabOptions.contains(e.target)) {
        fabMain.classList.remove('active');
        fabOptions.classList.remove('show');
      }
    });
    
    // FAB option click handlers
    const fabOptionButtons = document.querySelectorAll('.fab-option');
    fabOptionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = button.getAttribute('title');
        
        // Show different actions based on button
        if (title === 'Quick Quote') {
          showQuickQuote();
        } else if (title === 'Schedule Test Drive') {
          showTestDrive();
        } else if (title === 'Contact Sales') {
          showContactSales();
        }
        
        // Close FAB
        fabMain.classList.remove('active');
        fabOptions.classList.remove('show');
      });
    });
  }
});

// Demo Modal Functionality
document.addEventListener("DOMContentLoaded", () => {
  const watchDemoBtn = document.getElementById('watchDemo');
  const demoModal = document.getElementById('demoModal');
  const closeDemo = document.getElementById('closeDemo');
  
  if (watchDemoBtn && demoModal) {
    watchDemoBtn.addEventListener('click', () => {
      demoModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
    
    closeDemo.addEventListener('click', () => {
      demoModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    });
    
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        demoModal.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && demoModal.classList.contains('show')) {
        demoModal.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
  }
});

// FAB Action Functions
function showQuickQuote() {
  const modal = createModal('Quick Quote Calculator', `
    <div style="text-align: center; padding: 20px;">
      <h3>Get Your Instant Quote</h3>
      <p>Enter your vehicle details to get a personalized quote.</p>
      <form style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
        <select style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
          <option>Select Vehicle Type</option>
          <option>Sedan</option>
          <option>SUV</option>
          <option>Truck</option>
          <option>Bus</option>
        </select>
        <input type="text" placeholder="Your Budget (₦)" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <input type="text" placeholder="Your Location" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <button type="submit" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Get Quote</button>
      </form>
    </div>
  `);
  document.body.appendChild(modal);
}

function showTestDrive() {
  const modal = createModal('Schedule Test Drive', `
    <div style="text-align: center; padding: 20px;">
      <h3>Book Your Test Drive</h3>
      <p>Schedule a test drive for any vehicle in our inventory.</p>
      <form style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
        <input type="text" placeholder="Your Name" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <input type="tel" placeholder="Phone Number" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <input type="date" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <select style="padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
          <option>Select Preferred Time</option>
          <option>9:00 AM</option>
          <option>11:00 AM</option>
          <option>2:00 PM</option>
          <option>4:00 PM</option>
        </select>
        <button type="submit" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Schedule Test Drive</button>
      </form>
    </div>
  `);
  document.body.appendChild(modal);
}

function showContactSales() {
  const modal = createModal('Contact Sales Team', `
    <div style="text-align: center; padding: 20px;">
      <h3>Get in Touch</h3>
      <p>Our sales team is ready to help you find the perfect vehicle.</p>
      <div style="margin: 20px 0;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0;">
          <i class="fas fa-phone" style="color: #667eea;"></i>
          <span>+234 801 234 5678</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0;">
          <i class="fas fa-envelope" style="color: #667eea;"></i>
          <span>sales@hephauto.com</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0;">
          <i class="fas fa-map-marker-alt" style="color: #667eea;"></i>
          <span>Ibadan, Oyo State, Nigeria</span>
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    </div>
  `);
  document.body.appendChild(modal);
}

function createModal(title, content) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; max-width: 500px; width: 90%; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalSlideIn 0.3s ease;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px 30px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0; color: #333; font-size: 1.5rem;">${title}</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; color: #666; cursor: pointer; padding: 5px; border-radius: 50%; transition: all 0.3s ease;">&times;</button>
      </div>
      ${content}
    </div>
  `;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  return modal;
}



// === PROFESSIONAL PAGE LOADER LOGIC ===
document.addEventListener('DOMContentLoaded', function() {
  const loader = document.getElementById('pageLoader');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const loadingText = document.querySelector('.loading-text');
  
  if (sessionStorage.getItem('hephauto_loader_shown')) {
    if (loader) {
      loader.style.display = 'none';
    }
    return;
  }
  
  if (loader && progressFill && progressText) {
    let progress = 0;
    const targetProgress = 100;
    const duration = 800; // Snappy 0.8 seconds total
    const interval = 50; // Update every 50ms
    const increment = (targetProgress / (duration / interval));
    
    // Simulate realistic loading progress
    const progressIntervals = [
      { start: 0, end: 20, speed: 1.2 },    // Fast initial load
      { start: 20, end: 60, speed: 0.8 },   // Slower middle phase
      { start: 60, end: 85, speed: 0.6 },   // Even slower
      { start: 85, end: 95, speed: 0.3 },   // Very slow near end
      { start: 95, end: 100, speed: 0.1 }   // Final stretch
    ];
    
    const updateProgress = () => {
      if (progress < targetProgress) {
        // Find current interval
        const currentInterval = progressIntervals.find(interval => 
          progress >= interval.start && progress < interval.end
        );
        
        if (currentInterval) {
          progress += increment * currentInterval.speed;
        } else {
          progress += increment;
        }
        
        // Ensure progress doesn't exceed 100
        progress = Math.min(progress, targetProgress);
        
        // Update progress bar and text
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // Update loading text based on progress if element exists
        if (loadingText) {
          if (progress < 30) {
            loadingText.textContent = 'Initializing';
          } else if (progress < 60) {
            loadingText.textContent = 'Loading Assets';
          } else if (progress < 85) {
            loadingText.textContent = 'Preparing';
          } else if (progress < 100) {
            loadingText.textContent = 'Almost Ready';
          } else {
            loadingText.textContent = 'Welcome to HephAuto';
          }
        }
        
        // Continue animation
        requestAnimationFrame(updateProgress);
      } else {
        // Loading complete
        setTimeout(() => {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          setTimeout(() => {
            loader.style.display = 'none';
            sessionStorage.setItem('hephauto_loader_shown', 'true');
          }, 600);
        }, 500);
      }
    };
    
    // Start the progress animation
    setTimeout(() => {
      updateProgress();
    }, 200);
  }
});

// Enhanced Scroll Animations
document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe feature cards for animation
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
});

// ===== VIDEO BACKGROUND HANDLING =====
document.addEventListener("DOMContentLoaded", () => {
  const heroVideo = document.getElementById('heroVideo');
  
  if (heroVideo) {
    // Check if video can be played
    heroVideo.addEventListener('error', () => {
      console.log('Video failed to load, using fallback background');
      // Hide video element and rely on CSS fallback
      heroVideo.style.display = 'none';
    });
    
    // Check if video is supported
    if (heroVideo.canPlayType) {
      const canPlayMP4 = heroVideo.canPlayType('video/mp4');
      if (canPlayMP4 === '' || canPlayMP4 === 'no') {
        console.log('MP4 video not supported, using fallback background');
        heroVideo.style.display = 'none';
      }
    }
    
    // Handle video loading
    heroVideo.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });
    
    // Handle video play issues
    heroVideo.addEventListener('stalled', () => {
      console.log('Video playback stalled');
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      once: true,
      easing: 'ease-out',
      offset: 50,
    });
  } else {
    // AOS might load after via defer, wait for it
    window.addEventListener('load', () => {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 600,
          once: true,
          easing: 'ease-out',
          offset: 50,
        });
      }
    });
  }
});

// ===== CHECKOUT PAGE INTERACTIVITY =====
document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;

  const progressSteps = document.querySelectorAll('.progress-step');
  const sections = document.querySelectorAll('.checkout-section');
  const paymentOptions = document.querySelectorAll('input[name="payment"]');
  const agreeTerms = document.getElementById('agreeTerms');
  const detailInputs = checkoutForm.querySelectorAll('.buyer-info input[required], .delivery-options input[required], .delivery-options select[required]');

  // --- Validation Logic ---
  function validateDetails() {
    let isValid = true;
    detailInputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });
    if (!isValid) {
      const firstInvalid = checkoutForm.querySelector('.invalid');
      if(firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      alert('Please fill out all required fields in the "Buyer Information" and "Delivery Options" sections before proceeding.');
    }
    return isValid;
  }

  // Real-time validation feedback as user types
  detailInputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.classList.remove('invalid');
      }
    });
  });

  // --- Progress Bar & Navigation Logic ---
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionClassList = entry.target.classList;
        let currentStep = 0;
        if (sectionClassList.contains('payment-method') || sectionClassList.contains('tradein-discount')) {
          currentStep = 1;
        } else if (sectionClassList.contains('terms-conditions') || sectionClassList.contains('final-review') || sectionClassList.contains('add-ons')) {
          currentStep = 2;
        }
        progressSteps.forEach((step, index) => {
          step.classList.remove('active');
          if (index <= currentStep) {
            step.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4, rootMargin: "-100px 0px -100px 0px" });
  sections.forEach(section => sectionObserver.observe(section));

  // Make all progress steps always clickable
  progressSteps.forEach((step, index) => {
    step.classList.remove('disabled');
    step.addEventListener('click', () => {
      let targetSection;
      if (index === 0) {
        targetSection = checkoutForm.querySelector('.buyer-info');
      } else if (index === 1) {
        targetSection = checkoutForm.querySelector('.payment-method');
      } else if (index === 2) {
        targetSection = checkoutForm.querySelector('.final-review');
      }
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Payment Method Logic ---
  paymentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      const parentLabel = e.target.closest('.payment-option');
      document.querySelectorAll('.payment-option').forEach(label => {
        label.style.borderColor = '#ddd';
        label.style.boxShadow = 'none';
      });
      if(parentLabel) {
        parentLabel.style.borderColor = '#ff6b35';
        parentLabel.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.2)';
      }
    });
  });

  // --- Form Submission ---
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateDetails()) return;
    if (!agreeTerms.checked) {
      alert('You must agree to the Terms & Conditions to proceed.');
      const termsSection = document.querySelector('.terms-conditions');
      if (termsSection) {
        termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        termsSection.classList.add('highlight-error');
        setTimeout(() => termsSection.classList.remove('highlight-error'), 2000);
      }
      return;
    }
    const confirmationOverlay = document.createElement('div');
    confirmationOverlay.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001; backdrop-filter: blur(5px);">
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); animation: modalSlideIn 0.3s ease;">
          <i class="fas fa-check-circle" style="color: #28a745; font-size: 4rem; margin-bottom: 20px;"></i>
          <h2 style="color: #0d375e; margin-bottom: 15px;">Purchase Confirmed!</h2>
          <p style="color: #555; margin-bottom: 30px;">Thank you for your order. A confirmation has been sent to your email.</p>
          <a href="Heph.html" class="cta-btn primary" style="text-decoration: none;">Back to Home</a>
        </div>
      </div>
    `;
    document.body.appendChild(confirmationOverlay);
  });
});

// ===== DYNAMIC CHECKOUT FLOW =====
document.addEventListener("DOMContentLoaded", () => {
  // --- Step 1: Handle Purchase Button Clicks on product pages ---
  const purchaseButtons = document.querySelectorAll('.buy-now-btn');
  purchaseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Only intercept if the link goes to a checkout page, NOT view details
      const href = button.getAttribute('href') || '';
      if (href.includes('Checkout') || href.includes('checkout')) {
        e.preventDefault();
        const card = button.closest('.product-card');
        if (!card) return;

        // Extract all data attributes
        const product = {
          name: card.querySelector('h3')?.textContent.trim() || '',
          price: card.getAttribute('data-price') || '',
          make: card.getAttribute('data-make') || '',
          model: card.getAttribute('data-model') || '',
          year: card.getAttribute('data-year') || '',
          color: card.getAttribute('data-color') || '',
          condition: card.getAttribute('data-condition') || '',
          transmission: card.getAttribute('data-transmission') || '',
          fuel: card.getAttribute('data-fuel') || '',
          engineSize: card.getAttribute('data-engine-size') || '',
          seats: card.getAttribute('data-seats') || '',
          mileage: card.getAttribute('data-mileage') || '',
          images: card.getAttribute('data-images')?.split(',') || [],
        };
        // Use the first image as the main image
        product.image = product.images[0] || '';

        localStorage.setItem('checkoutProduct', JSON.stringify(product));
        window.location.href = href;
      }
      // Otherwise, let the link navigate naturally (e.g., Viewdetails.html)
    });
  });

  // --- Step 2: Populate Checkout Page with data from localStorage ---
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    const productData = localStorage.getItem('checkoutProduct');
    if (productData) {
      try {
        const product = JSON.parse(productData);
        // Mask VIN function
        function maskVin(vin) {
          if (!vin) return '';
          if (vin.length <= 6) return '*'.repeat(vin.length);
          return vin.slice(0, vin.length - 6) + '******';
        }
        // Select elements to update in Order Summary
        const vehicleImg = document.querySelector('.order-vehicle-img');
        const vehicleTitle = document.querySelector('.vehicle-title');
        const vehicleVin = document.getElementById('maskedVin');
        const detailsList = document.querySelector('.vehicle-details-list');
        const priceElements = document.querySelectorAll('.price-row');
        const finalPriceEl = document.querySelector('.final-price span');
        // Update the elements
        if (vehicleImg && product.image) vehicleImg.src = product.image;
        if (vehicleTitle) vehicleTitle.textContent = `${product.make || ''} ${product.model || ''} ${product.year || ''}`.trim();
        if (vehicleVin) vehicleVin.textContent = maskVin(product.vin);
        if (detailsList) {
          detailsList.innerHTML = `
            <li><strong>Make:</strong> ${product.make || ''}</li>
            <li><strong>Model:</strong> ${product.model || ''}</li>
            <li><strong>Year of Manufacture:</strong> ${product.year || ''}</li>
            <li><strong>Color:</strong> ${product.color || ''}</li>
            <li><strong>Transmission:</strong> ${product.transmission || ''}</li>
            <li><strong>Fuel:</strong> ${product.fuel || ''}</li>
            <li><strong>Drivetrain:</strong> ${product.drivetrain || ''}</li>
            <li><strong>Seats:</strong> ${product.seats || ''}</li>
            <li><strong>Number of Cylinders:</strong> ${product.cylinders || ''}</li>
            <li><strong>Engine Size:</strong> ${product.engineSize || ''} cc</li>
            <li><strong>Horsepower:</strong> ${product.horsepower || ''}</li>
            <li><strong>Condition:</strong> ${product.condition || ''}</li>
            <li><strong>Mileage:</strong> ${product.mileage || ''} km</li>
            <li><strong>Second Condition:</strong> ${product.secondCondition || ''}</li>
            <li><strong>Exchange Possible:</strong> ${product.exchangePossible || ''}</li>
            <li><strong>Registered:</strong> ${product.registered || ''}</li>
          `;
        }
        // Update price breakdown
        const basePrice = parseInt((product.price || '').replace(/[^0-9]/g, ''), 10) || 0;
        const taxes = Math.round(basePrice * 0.05); // 5% tax
        const delivery = 50000;
        const discount = 0; // No discount by default for this example
        const total = basePrice + taxes + delivery - discount;
        const formatCurrency = (amount) => '₦' + amount.toLocaleString('en-NG');
        if(priceElements.length >= 5) {
          priceElements[0].querySelector('span:last-child').textContent = formatCurrency(basePrice);
          priceElements[1].querySelector('span:last-child').textContent = formatCurrency(taxes);
          priceElements[2].querySelector('span:last-child').textContent = formatCurrency(delivery);
          priceElements[3].querySelector('span:last-child').textContent = `-${formatCurrency(discount)}`;
          priceElements[4].querySelector('span:last-child').textContent = formatCurrency(total);
        }
        if (finalPriceEl) {
          finalPriceEl.textContent = formatCurrency(total);
        }
        // Clean up localStorage to prevent reuse
        localStorage.removeItem('checkoutProduct');
      } catch (error) {
        console.error("Error parsing or using checkout product data:", error);
        localStorage.removeItem('checkoutProduct');
      }
    }
  }
});

// ===== REMOVE STATIC PAYMENT SECTION IF EXISTS =====
document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;
  // Remove any static payment-method section
  const staticPayment = checkoutForm.querySelector('.checkout-section.payment-method');
  if (staticPayment) staticPayment.remove();
});

// ===== DYNAMIC PAYMENT SECTION GENERATION =====
document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;

  // Find the buyer info/details section
  const detailsSection = checkoutForm.querySelector('.checkout-section.buyer-info');
  if (!detailsSection) return;

  // Create the payment section
  const paymentSection = document.createElement('section');
  paymentSection.className = 'checkout-section payment-method';
  paymentSection.innerHTML = `
    <h2>Payment Method</h2>
    <div class="payment-options">
      <label class="payment-option">
        <input type="radio" name="payment" value="card" checked>
        <span><i class="fas fa-credit-card"></i> Credit/Debit Card</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="payment" value="bank">
        <span><i class="fas fa-university"></i> Bank Transfer</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="payment" value="finance">
        <span><i class="fas fa-hand-holding-usd"></i> Financing</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="payment" value="paypal">
        <span><i class="fab fa-cc-paypal"></i> PayPal</span>
      </label>
    </div>
    <div class="secure-badge" style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 18px;">
      <div style="font-size: 1.1rem; color: #28a745; font-weight: 500; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-lock"></i> Secure Checkout
      </div>
      <div style="display: flex; align-items: center; gap: 14px; font-size: 1.5rem; margin-top: 2px;">
        <i class='fab fa-cc-visa' title='Visa' style='color:#1a1f71;'></i>
        <i class='fab fa-cc-mastercard' title='MasterCard' style='color:#eb001b;'></i>
        <i class='fab fa-cc-amex' title='American Express' style='color:#2e77bb;'></i>
        <i class='fab fa-cc-verve' title='Verve' style='color:#f9b233;'></i>
        <i class='fab fa-cc-paypal' title='PayPal' style='color:#003087;'></i>
        <i class='fas fa-university' title='Bank' style='color:#444;'></i>
        <i class='fas fa-hand-holding-usd' title='Financing' style='color:#28a745;'></i>
        <img src="assets/verify.png" alt="SSL" title="SSL" style="height:22px;vertical-align:middle; margin-left:8px;">
        <img src="assets/companies/amazon.png" alt="Amazon Pay" title="Amazon Pay" style="height:22px;vertical-align:middle;">
        <img src="assets/companies/meta.png" alt="Meta" title="Meta" style="height:22px;vertical-align:middle;">
      </div>
    </div>
  `;

  // Insert after the details section
  detailsSection.insertAdjacentElement('afterend', paymentSection);

  // Add interactivity for payment options (same as before)
  const paymentOptions = paymentSection.querySelectorAll('input[name="payment"]');
  paymentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      const parentLabel = e.target.closest('.payment-option');
      paymentSection.querySelectorAll('.payment-option').forEach(label => {
        label.style.borderColor = '#ddd';
        label.style.boxShadow = 'none';
      });
      if(parentLabel) {
        parentLabel.style.borderColor = '#ff6b35';
        parentLabel.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.2)';
      }
    });
  });
});

// Load previously uploaded products on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUploadedProducts();
});

function loadUploadedProducts() {
  const productCardsContainer = document.querySelector('.product-cards-container');
  if (!productCardsContainer) return;

  const uploadedProducts = JSON.parse(localStorage.getItem('uploadedProducts') || '[]');
  
  uploadedProducts.forEach(productData => {
    // Create product card from stored data
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.images = productData.images.join(',');
    card.dataset.productId = productData.id;

    // Create card structure
    const featuresList = productData.features.split(',').map(f => f.trim()).filter(f => f);
    
    card.innerHTML = `
      <div class="image-gallery">
        <div class="view-image-icon">
          <i class="fas fa-expand"></i>
        </div>
        <div class="delete-product-icon" title="Delete Product">
          <i class="fas fa-times"></i>
        </div>
      </div>
      <div class="card-navigation-dots"></div>
      <div class="product-info">
        <div class="product-info-top">
          <span class="location"><i class="fas fa-map-marker-alt"></i> ${productData.location}</span>
          <div class="card-actions">
            <button class="action-btn message-btn"><i class="far fa-comment-dots"></i></button>
            <button class="action-btn like-btn"><i class="far fa-heart"></i></button>
            <button class="action-btn bookmark-btn"><i class="far fa-bookmark"></i></button>
            <button class="action-btn share-btn"><i class="far fa-paper-plane"></i></button>
          </div>
        </div>
        <span class="status for-sale">${productData.status}</span>
        <h3>${productData.name}</h3>
        <h1>${productData.price}</h1>
        <div class="details">
          ${featuresList.map(f => `<span><i class='fas fa-check'></i> ${f}</span>`).join('')}
          <a href="#" class="buy-now-btn">View Details</a>
        </div>
      </div>
    `;

    // Initialize the image gallery for the card
    initializeGallery(card);
    
    // Add delete functionality
    const deleteIcon = card.querySelector('.delete-product-icon');
    if (deleteIcon) {
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProduct(productData.id, card);
      });
    }
    
    // Add to container
    productCardsContainer.appendChild(card);
  });
}

// Function to delete a product
function deleteProduct(productId, cardElement) {
  // Show confirmation dialog
  const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
  
  if (confirmed) {
    // Remove from localStorage
    const uploadedProducts = JSON.parse(localStorage.getItem('uploadedProducts') || '[]');
    const updatedProducts = uploadedProducts.filter(product => product.id !== productId);
    localStorage.setItem('uploadedProducts', JSON.stringify(updatedProducts));
    
    // Remove from DOM with animation
    cardElement.style.transform = 'scale(0.8)';
    cardElement.style.opacity = '0';
    cardElement.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      cardElement.remove();
      // Show success message
      showNotification('Product deleted successfully!', 'success');
    }, 300);
  }
}

// Function to show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : '#17a2b8'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  notification.querySelector('.notification-content').style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  notification.querySelector('.notification-close').style.cssText = `
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    margin-left: auto;
    padding: 0;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Close functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Function to close upload form
function closeUploadForm() {
  const uploadSection = document.querySelector('.upload-section');
  if (uploadSection) {
    uploadSection.style.display = 'none';
    document.body.classList.remove('show-upload-form');
  }
}

// User session display logic for navigation (reusable for all nav bars)
function renderUserNav() {
  const userSection = document.getElementById('userSection');
  const mobileUserSection = document.getElementById('mobileUserSection');
  let sessionData = localStorage.getItem('hephAutoSession') || sessionStorage.getItem('hephAutoSession');
  let desktopHtml = '';
  let mobileHtml = '';
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      // Desktop nav (simple, compact)
      desktopHtml = `
        <span class="user-greeting">Hi, ${session.username || session.name || session.email.split('@')[0]}</span>
        <button class="login-btn" id="logoutBtn" style="margin-left:10px;">Logout</button>
      `;
      // Mobile nav (modern card style)
      mobileHtml = `
        <div class="mobile-login-card">
          <div class="mobile-login-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="mobile-login-info">
            <div class="mobile-login-greeting">Hi, ${session.username || session.name || session.email.split('@')[0]}</div>
            <button class="mobile-logout-btn" id="logoutBtn">Logout</button>
          </div>
        </div>
      `;
    } catch (e) {
      desktopHtml = `<a href="login.html"><button class="login-btn">Log in</button></a>`;
      mobileHtml = `<a href="login.html" class="mobile-login-btn"><i class="fas fa-user"></i> Login</a>`;
    }
  } else {
    desktopHtml = `<a href="login.html"><button class="login-btn">Log in</button></a>`;
    mobileHtml = `<a href="login.html" class="mobile-login-btn"><i class="fas fa-user"></i> Login</a>`;
  }
  if (userSection) userSection.innerHTML = desktopHtml;
  if (mobileUserSection) mobileUserSection.innerHTML = mobileHtml;

  // Attach logout event
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      localStorage.removeItem('hephAutoSession');
      sessionStorage.removeItem('hephAutoSession');
      window.location.href = 'login.html';
    };
  }
}

// Run on DOMContentLoaded for all pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderUserNav);
} else {
  renderUserNav();
}

// Re-render user nav after mobile menu toggles (if needed)
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const closeMenuBtn = document.getElementById('closeMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (menuToggle) menuToggle.addEventListener('click', renderUserNav);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', renderUserNav);
  if (overlay) overlay.addEventListener('click', renderUserNav);
});


// Global event delegation for logout (works for both desktop and mobile navs)
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'logoutBtn') {
    localStorage.removeItem('hephAutoSession');
    sessionStorage.removeItem('hephAutoSession');
    window.location.href = 'login.html';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const floatingUploadBtn = document.getElementById('floatingUploadBtn');
  const uploadSection = document.querySelector('.upload-section');
  
  // Hide upload section by default
  if (uploadSection) {
    uploadSection.style.display = 'none';
  }
  
  if (floatingUploadBtn) {
    floatingUploadBtn.addEventListener('click', function() {
      if (uploadSection) {
        // Toggle the upload section
        if (uploadSection.style.display === 'none' || uploadSection.style.display === '') {
          uploadSection.style.display = 'flex';
        } else {
          uploadSection.style.display = 'none';
        }
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var mobileSearchInput = document.getElementById('mobileMenuSearchInput');
  var mobileSearchIcon = document.getElementById('mobileMenuSearchIcon');
  function goToProductsSearch() {
    var query = mobileSearchInput.value.trim();
    if (query) {
      window.location.href = 'buy.html?search=' + encodeURIComponent(query);
    } else {
      window.location.href = 'buy.html';
    }
  }
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        goToProductsSearch();
      }
    });
  }
  if (mobileSearchIcon) {
    mobileSearchIcon.addEventListener('click', goToProductsSearch);
  }
});

// Load uploaded products from localStorage and display them in buy.html
if (window.location.pathname.includes('buy.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const productCardsContainer = document.querySelector('.product-cards-container');
    if (!productCardsContainer) return;
    const uploadedProducts = JSON.parse(localStorage.getItem('uploadedProducts') || '[]');
    uploadedProducts.forEach(productData => {
      // Create product card from stored data
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('data-make', productData.make || '');
      card.setAttribute('data-model', productData.model || '');
      card.setAttribute('data-year', productData.year || '');
      card.setAttribute('data-color', productData.color || '');
      card.setAttribute('data-condition', productData.condition || '');
      card.setAttribute('data-transmission', productData.transmission || '');
      card.setAttribute('data-fuel', productData.fuel || '');
      card.setAttribute('data-engine-size', productData.engine || '');
      card.setAttribute('data-seats', productData.seats || '');
      card.setAttribute('data-mileage', productData.mileage || '');
      card.setAttribute('data-price', productData.price || '');
      card.setAttribute('data-images', (productData.images || []).join(','));
      // Card inner HTML (align with existing structure)
      card.innerHTML = `
        <div class="image-gallery">
          <div class="view-image-icon">
            <i class="fas fa-expand"></i>
          </div>
        </div>
        <div class="card-navigation-dots"></div>
        <div class="product-info">
          <div class="product-info-top">
            <span class="location"><i class="fas fa-map-marker-alt"></i> ${productData.location || ''}</span>
            <div class="card-actions">
              <button class="action-btn like-btn"><i class="far fa-heart"></i></button>
              <button class="action-btn bookmark-btn"><i class="far fa-bookmark"></i></button>
              <button class="action-btn share-btn"><i class="far fa-paper-plane"></i></button>
            </div>
          </div>
          <span class="status for-sale">${productData.status || 'For Sale'}</span>
          <h3>${productData.name || ''}</h3>
          <h1>${productData.price || ''}</h1>
          <div class="details">
            ${(productData.features || '').split(',').map(f => `<span><i class='fas fa-check'></i> ${f.trim()}</span>`).join('')}
            <a href="#" class="buy-now-btn">View Details</a>
          </div>
        </div>
      `;
      // Optionally, initialize gallery and actions if needed
      productCardsContainer.appendChild(card);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const sellBtn = document.querySelector('.car-ad-sell-btn');
  const successMsg = document.getElementById('sellSuccessMsg');
  if (sellBtn && successMsg) {
    sellBtn.addEventListener('click', function(e) {
      e.preventDefault();
      successMsg.style.display = 'flex';
      setTimeout(() => {
        window.location.href = sellBtn.href;
      }, 1200);
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Hamburger/mobile menu login state (now using #mobileUserSection)
  function updateMobileUserSection() {
    const mobileUserSection = document.getElementById('mobileUserSection');
    if (!mobileUserSection) return;
    const user = getCurrentUser && getCurrentUser();
    if (user) {
      mobileUserSection.innerHTML = `
        <div class="mobile-user-greeting">👋 Hi, ${user.name || 'User'}</div>
        <button class="mobile-logout-btn" id="logoutBtn">Logout</button>
      `;
      mobileUserSection.querySelector('.mobile-logout-btn').onclick = () => logoutUser && logoutUser();
    } else {
      mobileUserSection.innerHTML = `
        <a href="login.html" class="mobile-login-btn"><i class="fas fa-user"></i> Login</a>
      `;
    }
  }

  updateMobileUserSection();
  window.addEventListener('storage', updateMobileUserSection);
});

// Logout confirmation modal logic
function setupLogoutModal() {
  const modal = document.getElementById('logoutConfirmModal');
  const closeBtn = document.querySelector('.logout-close-btn');
  const cancelBtn = document.querySelector('.logout-cancel-btn');
  const confirmBtn = document.querySelector('.logout-confirm-btn');

  function showModal() {
    if (modal) modal.style.display = 'flex';
  }
  function hideModal() {
    if (modal) modal.style.display = 'none';
  }
  // Attach to all logout buttons
  document.body.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'logoutBtn') {
      e.preventDefault();
      showModal();
    }
  });
  if (closeBtn) closeBtn.onclick = hideModal;
  if (cancelBtn) cancelBtn.onclick = function(e) { e.preventDefault(); hideModal(); };
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal || e.target.classList.contains('logout-modal-backdrop')) hideModal();
    });
  }
  if (confirmBtn) confirmBtn.onclick = function(e) {
    e.preventDefault();
    localStorage.removeItem('hephAutoSession');
    sessionStorage.removeItem('hephAutoSession');
    // Show success message in modal
    const modalContent = document.querySelector('.logout-modal-content');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="logout-icon">✅</div>
        <h2>Logged Out</h2>
        <p>You have successfully logged out.</p>
      `;
    }
    setTimeout(function() {
      window.location.href = 'login.html';
    }, 1500);
  };
}

// Contact Dropdown Logic for Desktop
function setupContactDropdown() {
  var wrapper = document.getElementById('contactDropdownWrapper');
  var btn = document.getElementById('contactDropdownBtn');
  var menu = document.getElementById('contactDropdownMenu');
  if (wrapper && btn && menu) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      wrapper.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.toggle('open');
      }
    });
  }
}
// Contact Dropdown Logic for Mobile
function setupContactDropdownMobile() {
  var wrapper = document.getElementById('contactDropdownWrapperMobile');
  var btn = document.getElementById('contactDropdownBtnMobile');
  var menu = document.getElementById('contactDropdownMenuMobile');
  if (wrapper && btn && menu) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      wrapper.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.toggle('open');
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', function() {
  setupContactDropdown();
  setupContactDropdownMobile();
});

// === ENHANCED NAVBAR SCROLL EFFECTS ===
function setupNavbarScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scrolled class for styling
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
  }, { passive: true });
}

// === ENHANCED ANIMATIONS AND INTERACTIONS ===
function setupEnhancedAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animateElements = document.querySelectorAll('.product-card, .feature-card, .testimonial-card');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// === PERFORMANCE OPTIMIZATIONS ===
function setupPerformanceOptimizations() {
  // Debounced scroll handler
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      // Performance cleanup
      document.body.classList.add('scrolling');
    }, 100);
  });
  
  // Remove scrolling class after scroll ends
  window.addEventListener('scrollend', function() {
    document.body.classList.remove('scrolling');
  });
}


// === LAZY LOADING FOR IMAGES ===
function setupLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// === SMOOTH SCROLLING ===
function setupSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// === ERROR HANDLING ===
window.addEventListener('error', function(e) {
  console.error('HephAuto Error:', e.error);
  // You can add error reporting here
});

// === PWA SUPPORT (Future Enhancement) ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Register service worker for PWA functionality
    // navigator.serviceWorker.register('/sw.js');
  });
}

// === UTILITY FUNCTIONS ===
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


// === ENHANCED MOBILE EXPERIENCE ===
function setupMobileEnhancements() {
  // Touch feedback for mobile
  const touchElements = document.querySelectorAll('.product-card, .feature-card, .cta-btn');
  
  touchElements.forEach(element => {
    element.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });
  });
}

// === INITIALIZE ALL ENHANCEMENTS ON DOM READY ===
document.addEventListener('DOMContentLoaded', function() {
  setupSmoothScrolling();
  setupLazyLoading();
  setupMobileEnhancements();
  setupPerformanceOptimizations();
  setupLogoutModal();
});

/* ============================================================
   NEW PROFESSIONAL FEATURES — HEPHAUTO JS
   ============================================================ */

/* ===== TOAST NOTIFICATION HELPER ===== */
function showHephToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3500;
  var toast = document.getElementById('hephToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hephToast';
    toast.className = 'heph-toast';
    document.body.appendChild(toast);
  }
  var icons = { success: 'fa-check-circle', info: 'fa-info-circle', alert: 'fa-bell' };
  toast.className = 'heph-toast ' + type;
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + message;
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { toast.classList.add('show'); });
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.classList.remove('show'); }, duration);
}

/* ===== FEATURE 3: RECENTLY VIEWED ===== */
var RV_KEY = 'heph_recently_viewed';
var RV_MAX = 6;

function saveRecentlyViewed(card) {
  var name  = (card.querySelector('h3') || {}).textContent || '';
  name = name.trim();
  var price = (card.querySelector('h1') || {}).textContent || '';
  price = price.trim();
  var imgs = (card.dataset.images || '').split(',');
  var img  = (imgs[0] || '').trim();
  var make  = card.dataset.make  || '';
  var model = card.dataset.model || '';
  var id    = (make + '-' + model + '-' + price).replace(/\s+/g,'');
  if (!name || !img) return;
  var list = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
  list = list.filter(function(v) { return v.id !== id; });
  list.unshift({ id: id, name: name, price: price, img: img, make: make, model: model });
  if (list.length > RV_MAX) list = list.slice(0, RV_MAX);
  localStorage.setItem(RV_KEY, JSON.stringify(list));
}

function renderRecentlyViewedStrip() {
  var sections = document.querySelectorAll('.recently-viewed-section');
  if (!sections.length) return;
  var list = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
  sections.forEach(function(section) {
    var strip = section.querySelector('.recently-viewed-strip');
    if (!strip) return;
    if (!list.length) { section.classList.remove('has-items'); return; }
    section.classList.add('has-items');
    strip.innerHTML = list.map(function(v) {
      return '<a class="rv-card" href="Viewdetails.html" title="' + v.name + '">' +
        '<img src="' + v.img + '" alt="' + v.name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<div class="rv-card-info">' +
          '<div class="rv-card-name">' + v.name + '</div>' +
          '<div class="rv-card-price">' + v.price + '</div>' +
        '</div></a>';
    }).join('');
  });
}

/* ===== FEATURE 4: DEAL RATING BADGE ===== */
function injectDealBadges() {
  var cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;
  var priceMap = {};
  cards.forEach(function(card) {
    var key  = (card.dataset.make || '') + '-' + (card.dataset.model || '');
    var raw  = (card.dataset.price || '').replace(/[₦,\s]/g, '');
    var price = parseFloat(raw);
    if (!isNaN(price)) {
      if (!priceMap[key]) priceMap[key] = [];
      priceMap[key].push(price);
    }
  });
  cards.forEach(function(card) {
    var gallery = card.querySelector('.image-gallery');
    if (!gallery || card.querySelector('.deal-badge')) return;
    var key   = (card.dataset.make || '') + '-' + (card.dataset.model || '');
    var raw   = (card.dataset.price || '').replace(/[₦,\s]/g, '');
    var price = parseFloat(raw);
    if (isNaN(price)) return;
    var group = priceMap[key] || [price];
    var avg   = group.reduce(function(a, b) { return a + b; }, 0) / group.length;
    var diff  = (price - avg) / avg;
    var cls, label;
    if (diff < -0.15)      { cls = 'great'; label = '🟢 Great Deal'; }
    else if (diff < -0.05) { cls = 'good';  label = '🔵 Good Deal'; }
    else if (diff <= 0.05) { cls = 'fair';  label = '⚪ Fair Price'; }
    else                   { cls = 'high';  label = '🔴 High Price'; }
    gallery.style.position = 'relative';
    var badge = document.createElement('span');
    badge.className = 'deal-badge ' + cls;
    badge.textContent = label;
    gallery.appendChild(badge);
  });
}

/* ===== FEATURE 8: LISTING BADGES ===== */
function injectListingBadges() {
  document.querySelectorAll('.product-card').forEach(function(card) {
    var gallery = card.querySelector('.image-gallery');
    if (!gallery) return;
    gallery.style.position = 'relative';
    if (card.dataset.sold === 'true') {
      if (!gallery.querySelector('.sold-overlay')) {
        gallery.insertAdjacentHTML('beforeend',
          '<div class="sold-overlay"><span class="sold-stamp">SOLD</span></div>');
      }
      card.insertAdjacentHTML('beforeend', '<span class="listing-badge sold-badge">Sold</span>');
      return;
    }
    if (card.dataset.priceDropped === 'true') {
      card.insertAdjacentHTML('beforeend', '<span class="listing-badge drop-badge">Price Drop ↓</span>');
    }
    var listed = card.dataset.listedDate;
    if (listed) {
      var days = (Date.now() - new Date(listed).getTime()) / 86400000;
      if (days <= 7) {
        card.insertAdjacentHTML('beforeend', '<span class="listing-badge new-badge">New</span>');
      }
    }
    if (card.dataset.inspected === 'true') {
      gallery.insertAdjacentHTML('beforeend',
        '<span class="inspected-badge"><i class="fas fa-shield-alt"></i> Inspected</span>');
    }
  });
}

/* ===== FEATURE 9: WATCH / PRICE ALERT ===== */
var WATCH_KEY = 'heph_watchlist';
function getWatchlist() { return JSON.parse(localStorage.getItem(WATCH_KEY) || '[]'); }
function saveWatchlist(list) { localStorage.setItem(WATCH_KEY, JSON.stringify(list)); }

function setupWatchButtons() {
  document.querySelectorAll('.watch-btn').forEach(function(btn) {
    var card  = btn.closest('.product-card');
    if (!card) return;
    var make  = card.dataset.make  || '';
    var model = card.dataset.model || '';
    var raw   = (card.dataset.price || '').replace(/[₦,\s]/g, '');
    var price = parseFloat(raw);
    var id    = (make + '-' + model).replace(/\s+/g,'');
    var nameEl = card.querySelector('h3');
    var name  = nameEl ? nameEl.textContent.trim() : (make + ' ' + model);
    var list  = getWatchlist();
    if (list.find(function(w) { return w.id === id; })) {
      btn.classList.add('watching');
      btn.innerHTML = '<i class="fas fa-bell"></i> Watching';
    }
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var wl = getWatchlist();
      var exists = wl.find(function(w) { return w.id === id; });
      if (exists) {
        wl = wl.filter(function(w) { return w.id !== id; });
        btn.classList.remove('watching');
        btn.innerHTML = '<i class="far fa-bell"></i> Watch';
        showHephToast('Removed ' + name + ' from watchlist', 'info');
      } else {
        wl.push({ id: id, name: name, price: price, make: make, model: model });
        btn.classList.add('watching');
        btn.innerHTML = '<i class="fas fa-bell"></i> Watching';
        showHephToast('🔔 Watching ' + name + ' — you\'ll be alerted on price drops', 'success');
      }
      saveWatchlist(wl);
    });
  });
}

function checkPriceAlerts() {
  var wl    = getWatchlist();
  var cards = document.querySelectorAll('.product-card');
  wl.forEach(function(watched) {
    cards.forEach(function(card) {
      var id  = ((card.dataset.make || '') + '-' + (card.dataset.model || '')).replace(/\s+/g,'');
      var raw = (card.dataset.price || '').replace(/[₦,\s]/g, '');
      var cur = parseFloat(raw);
      if (id === watched.id && !isNaN(cur) && cur < watched.price) {
        var saved = (watched.price / 1e6).toFixed(1);
        var now   = (cur / 1e6).toFixed(1);
        setTimeout(function() {
          showHephToast('💰 Price Drop! ' + watched.name + ' — was ₦' + saved + 'M, now ₦' + now + 'M', 'alert', 5000);
        }, 1500);
        watched.price = cur;
        saveWatchlist(wl);
      }
    });
  });
}

/* ===== FEATURE 6: VEHICLE COMPARISON TRAY ===== */
var compareList = [];
var COMPARE_MAX = 3;

function setupComparisonTray() {
  var tray = document.getElementById('compareTray');
  if (!tray) return;
  document.querySelectorAll('.compare-checkbox').forEach(function(chk) {
    chk.addEventListener('change', function() {
      var card  = this.closest('.product-card');
      var nameEl = card.querySelector('h3');
      var name  = nameEl ? nameEl.textContent.trim() : 'Vehicle';
      var make  = card.dataset.make  || '';
      var model = card.dataset.model || '';
      var price = card.dataset.price || '';
      var year  = card.dataset.year  || '';
      var fuel  = card.dataset.fuel  || '';
      var trans = card.dataset.transmission || '';
      var miles = card.dataset.mileage || '';
      var seats = card.dataset.seats  || '';
      var eng   = card.dataset.engineSize || '';
      var cond  = card.dataset.condition  || '';
      var imgs  = (card.dataset.images || '').split(',');
      var img   = (imgs[0] || '').trim();
      var id    = (make + '-' + model + '-' + price).replace(/\s+/g,'');
      if (this.checked) {
        if (compareList.length >= COMPARE_MAX) {
          this.checked = false;
          showHephToast('Max ' + COMPARE_MAX + ' vehicles for comparison', 'info');
          return;
        }
        compareList.push({ id:id, name:name, make:make, model:model, year:year, price:price, fuel:fuel, trans:trans, miles:miles, seats:seats, eng:eng, cond:cond, img:img });
      } else {
        compareList = compareList.filter(function(v) { return v.id !== id; });
      }
      renderCompareTray(tray);
    });
  });
}

function renderCompareTray(tray) {
  if (!tray) return;
  if (!compareList.length) { tray.classList.remove('visible'); return; }
  tray.classList.add('visible');
  var carsHtml = compareList.map(function(v) {
    return '<span class="compare-tray-car">' + v.name +
      '<button class="remove-compare" data-id="' + v.id + '" title="Remove"><i class="fas fa-times"></i></button>' +
      '</span>';
  }).join('');
  tray.innerHTML =
    '<span class="compare-tray-label"><i class="fas fa-exchange-alt"></i> Compare (' + compareList.length + '/' + COMPARE_MAX + ')</span>' +
    '<div class="compare-tray-cars">' + carsHtml + '</div>' +
    '<button class="compare-now-btn" id="doCompareBtn"' + (compareList.length < 2 ? ' disabled' : '') + '>' +
    '<i class="fas fa-columns"></i> Compare Now</button>';
  tray.querySelectorAll('.remove-compare').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.id;
      compareList = compareList.filter(function(v) { return v.id !== id; });
      document.querySelectorAll('.compare-checkbox').forEach(function(chk) {
        var card = chk.closest('.product-card');
        var cid  = ((card.dataset.make||'') + '-' + (card.dataset.model||'') + '-' + (card.dataset.price||'')).replace(/\s+/g,'');
        if (cid === id) chk.checked = false;
      });
      renderCompareTray(tray);
    });
  });
  var doBtn = document.getElementById('doCompareBtn');
  if (doBtn) {
    doBtn.addEventListener('click', function() {
      sessionStorage.setItem('heph_compare', JSON.stringify(compareList));
      window.location.href = 'compare.html';
    });
  }
}

/* ===== FEATURE 2: LOAN CALCULATOR ===== */
function setupLoanCalculator() {
  var calc = document.getElementById('loanCalc');
  if (!calc) return;
  var priceInput   = calc.querySelector('#loanPrice');
  var depositInput = calc.querySelector('#loanDeposit');
  var termSelect   = calc.querySelector('#loanTerm');
  var rateInput    = calc.querySelector('#loanRate');
  var monthlyEl    = calc.querySelector('#loanMonthly');
  var interestEl   = calc.querySelector('#loanInterest');
  var totalEl      = calc.querySelector('#loanTotal');

  var priceEl = document.getElementById('vehiclePrice') || document.getElementById('basePrice');
  if (priceEl && priceInput) {
    var raw = priceEl.textContent.replace(/[₦,\s]/g, '');
    priceInput.value = raw || '';
  }

  function calculate() {
    var P    = parseFloat((priceInput   ? priceInput.value   : '0').replace(/[^0-9.]/g,'')) || 0;
    var D    = parseFloat((depositInput ? depositInput.value : '0').replace(/[^0-9.]/g,'')) || 0;
    var n    = parseInt(termSelect  ? termSelect.value  : '36');
    var rate = parseFloat(rateInput ? rateInput.value   : '20') / 100 / 12;
    var loan = Math.max(0, P - D);
    var monthly, totalInterest, totalCost;
    if (loan <= 0)   { monthly = 0; totalInterest = 0; totalCost = P; }
    else if (rate===0){ monthly = loan/n; totalInterest = 0; totalCost = P; }
    else {
      monthly       = loan * rate * Math.pow(1+rate,n) / (Math.pow(1+rate,n) - 1);
      totalInterest = monthly*n - loan;
      totalCost     = P - D + monthly*n;
    }
    function fmt(v) { return '₦' + Math.round(v).toLocaleString('en-NG'); }
    if (monthlyEl)  monthlyEl.textContent  = fmt(monthly);
    if (interestEl) interestEl.textContent = fmt(totalInterest);
    if (totalEl)    totalEl.textContent    = fmt(totalCost);
  }

  [priceInput, depositInput, rateInput].forEach(function(el) {
    if (el) el.addEventListener('input', calculate);
  });
  if (termSelect) termSelect.addEventListener('change', calculate);
  calculate();
}

/* ===== FEATURE 5: TEST DRIVE MODAL ===== */
function setupTestDriveModal() {
  var modal   = document.getElementById('testDriveModal');
  var openBtn  = document.getElementById('openTestDriveBtn');
  var closeBtn = document.getElementById('closeTestDriveModal');
  var form     = document.getElementById('testDriveForm');
  if (!modal) return;
  if (openBtn)  openBtn.addEventListener('click',  function() { modal.classList.add('open'); });
  if (closeBtn) closeBtn.addEventListener('click', function() { modal.classList.remove('open'); });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = (form.querySelector('#tdName')     || {}).value || '';
      var phone= (form.querySelector('#tdPhone')    || {}).value || '';
      var date = (form.querySelector('#tdDate')     || {}).value || '';
      var time = (form.querySelector('#tdTime')     || {}).value || '';
      var loc  = (form.querySelector('#tdLocation') || {}).value || 'HephAuto Showroom';
      var car  = (document.getElementById('vehicleTitle') || {}).textContent || 'your vehicle';
      var waNum = '2348000000000';
      var msg   = encodeURIComponent(
        'Hello HephAuto! I\'d like to book a test drive.\n\nVehicle: ' + car +
        '\nName: ' + name + '\nPhone: ' + phone + '\nDate: ' + date +
        '\nTime: ' + time + '\nLocation: ' + loc + '\n\nPlease confirm my booking. Thank you!');
      modal.classList.remove('open');
      showHephToast('Test drive booked! Opening WhatsApp to confirm…', 'success');
      setTimeout(function() { window.open('https://wa.me/' + waNum + '?text=' + msg, '_blank'); }, 800);
      form.reset();
    });
  }
}

/* ===== FEATURE 7: TRADE-IN ESTIMATOR ===== */
function setupTradeInEstimator() {
  var section = document.getElementById('tradeinSection');
  if (!section) return;
  var selectedCondition = 'good';
  section.querySelectorAll('.tradein-condition-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      section.querySelectorAll('.tradein-condition-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedCondition = btn.dataset.condition;
    });
  });
  var estimateBtn = section.querySelector('#tradeinEstimateBtn');
  if (estimateBtn) {
    estimateBtn.addEventListener('click', function() {
      var makeEl  = section.querySelector('#tradeinMake');
      var yearEl  = section.querySelector('#tradeinYear');
      var mileEl  = section.querySelector('#tradeinMileage');
      var make    = makeEl  ? makeEl.value.trim()  : '';
      var year    = yearEl  ? parseInt(yearEl.value) : 0;
      var mileage = mileEl  ? parseInt((mileEl.value || '0').replace(/[^0-9]/g,'')) : 0;
      if (!make || !year) { showHephToast('Please fill in the Make and Year fields', 'info'); return; }
      var currentYear  = new Date().getFullYear();
      var age          = currentYear - year;
      var baseValue    = 15000000;
      var ageDecay     = Math.max(0.2, 1 - age * 0.06);
      var condFactor   = { excellent: 1.15, good: 1.0, fair: 0.80, poor: 0.55 }[selectedCondition] || 1;
      var mileFactor   = Math.max(0.5, 1 - mileage / 400000);
      var estimated    = Math.round(baseValue * ageDecay * condFactor * mileFactor);
      var low  = Math.round(estimated * 0.88);
      var high = Math.round(estimated * 1.12);
      function fmt(v) { return '₦' + (v/1e6).toFixed(1) + 'M'; }
      var result = section.querySelector('#tradeinResult');
      if (result) {
        var valEl = section.querySelector('#tradeinValue');
        if (valEl) valEl.textContent = fmt(low) + ' – ' + fmt(high);
        result.classList.add('show');
      }
    });
  }
  var useBtn = section.querySelector('#tradeinUseBtn');
  if (useBtn) {
    useBtn.addEventListener('click', function() {
      showHephToast('Value saved! Use it as your down payment in the Loan Calculator on any vehicle page.', 'success', 4000);
    });
  }
}

/* ===== FEATURE 10: INSPECTION PANEL ===== */
function setupInspectionPanel() {
  document.querySelectorAll('.inspection-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var open = btn.classList.toggle('open');
      var body = btn.nextElementSibling;
      if (body) body.classList.toggle('open', open);
    });
  });
}

/* ===== INITIALIZE ALL NEW FEATURES ===== */
document.addEventListener('DOMContentLoaded', function() {
  renderRecentlyViewedStrip();
  injectDealBadges();
  injectListingBadges();
  setupWatchButtons();
  checkPriceAlerts();
  setupComparisonTray();
  setupLoanCalculator();
  setupTestDriveModal();
  setupTradeInEstimator();
  setupInspectionPanel();
  updateNavigationBadges();

  document.querySelectorAll('.product-card').forEach(function(card) {
    var detailBtn = card.querySelector('.buy-now-btn');
    if (detailBtn) detailBtn.addEventListener('click', function() { saveRecentlyViewed(card); });
  });
});

/* ===== UNREAD MESSAGE BADGES ===== */
function updateNavigationBadges() {
  var conversations = JSON.parse(localStorage.getItem('heph_conversations') || '[]');
  var unreadCount = conversations.reduce(function(acc, c) { return acc + (c.unread ? 1 : 0); }, 0);
  
  var msgLinks = document.querySelectorAll('a[href="messages.html"]');
  msgLinks.forEach(function(link) {
    link.style.position = 'relative';
    var badge = link.querySelector('.nav-badge');
    if (unreadCount > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.style.cssText = 'position: absolute; top: 4px; right: calc(50% - 18px); background: #ef4444; color: white; border-radius: 50%; font-size: 9px; min-width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-weight: bold; padding: 2px; box-sizing: border-box; border: 1px solid white; line-height: 1; z-index: 10;';
        link.appendChild(badge);
      }
      badge.textContent = unreadCount;
    } else {
      if (badge) badge.remove();
    }
  });
}


