// Paul Graham Essay Viewer - Content Script
// Creates modern horizontal navigation with dropdown

(function () {
  'use strict';

  function init() {
    // Add body class for styling
    document.body.classList.add('pg-enhanced');

    // Extract and create horizontal navigation
    createModernHeader();

    // Hide the original vertical navigation
    hideVerticalNav();
  }

  function createModernHeader() {
    // Find the image map
    const map = document.querySelector('map');
    if (!map) return;

    // Extract navigation items from the image map
    const areas = map.querySelectorAll('area');
    const navItems = [];

    areas.forEach(area => {
      const href = area.getAttribute('href');
      const coords = area.getAttribute('coords');

      if (href && coords) {
        // Parse coordinates to get the vertical position (to determine order)
        const coordArray = coords.split(',');
        const yPos = parseInt(coordArray[1]);

        // Determine label from href
        let label = getMenuLabel(href);

        navItems.push({ href, label, yPos });
      }
    });

    // Sort by vertical position
    navItems.sort((a, b) => a.yPos - b.yPos);

    // Create header
    const header = document.createElement('header');
    header.className = 'pg-header';

    // Create brand
    const brand = document.createElement('a');
    brand.href = 'index.html';
    brand.className = 'pg-brand';
    brand.textContent = 'Paul Graham';

    // Create navigation
    const nav = document.createElement('nav');
    nav.className = 'pg-nav';

    const navList = document.createElement('ul');
    navList.className = 'pg-nav-list';

    // Show first 6 items, rest in "More" dropdown
    const primaryCount = 6;

    // Add primary nav items
    navItems.slice(0, primaryCount).forEach(item => {
      const li = createNavItem(item);
      navList.appendChild(li);
    });

    // Add "More" dropdown if there are remaining items
    if (navItems.length > primaryCount) {
      const moreLi = document.createElement('li');
      moreLi.className = 'pg-nav-item pg-nav-more';

      const moreLink = document.createElement('a');
      moreLink.href = '#';
      moreLink.className = 'pg-nav-link';
      moreLink.textContent = 'More';
      moreLink.onclick = (e) => {
        e.preventDefault();
        moreLi.classList.toggle('active');
      };

      const dropdown = document.createElement('ul');
      dropdown.className = 'pg-dropdown';

      navItems.slice(primaryCount).forEach(item => {
        const dropdownLi = document.createElement('li');
        dropdownLi.className = 'pg-dropdown-item';

        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'pg-dropdown-link';
        a.textContent = item.label;

        dropdownLi.appendChild(a);
        dropdown.appendChild(dropdownLi);
      });

      moreLi.appendChild(moreLink);
      moreLi.appendChild(dropdown);
      navList.appendChild(moreLi);
    }

    nav.appendChild(navList);

    header.appendChild(brand);
    header.appendChild(nav);

    // Insert header at the beginning of body
    document.body.insertBefore(header, document.body.firstChild);
  }

  function createNavItem(item) {
    const li = document.createElement('li');
    li.className = 'pg-nav-item';

    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'pg-nav-link';
    a.textContent = item.label;

    li.appendChild(a);
    return li;
  }

  function getMenuLabel(href) {
    // Map hrefs to clean labels
    const labelMap = {
      'index.html': 'Home',
      'articles.html': 'Articles',
      'books.html': 'Books',
      'arc.html': 'Arc',
      'bel.html': 'Bel',
      'lisp.html': 'Lisp',
      'antispam.html': 'Spam Filter',
      'kedrosky.html': 'Kedrosky',
      'faq.html': 'FAQ',
      'raq.html': 'RAQ',
      'quo.html': 'Quotes',
      'rss.html': 'RSS',
      'bio.html': 'Bio',
      'ind.html': 'Index',
      'info.html': 'Info'
    };

    // Check if it's in our map
    for (const [key, value] of Object.entries(labelMap)) {
      if (href.includes(key)) return value;
    }

    // Handle external links
    if (href.includes('ycombinator.com')) return 'Y Combinator';
    if (href.includes('amazon.com')) return 'Hackers & Painters';
    if (href.includes('twitter.com')) return 'Twitter';
    if (href.includes('mas.to')) return 'Mastodon';

    // Default: clean up the href
    let label = href.replace('.html', '').replace('http://', '').replace('https://', '');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function hideVerticalNav() {
    // Hide the first column (navigation) and spacer
    const mainTable = document.querySelector('body > table');
    if (!mainTable) return;

    const cells = mainTable.querySelectorAll('tr > td');
    if (cells.length >= 2) {
      cells[0].style.display = 'none'; // Navigation column
      cells[1].style.display = 'none'; // Spacer column
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pg-nav-more')) {
      document.querySelectorAll('.pg-nav-more.active').forEach(item => {
        item.classList.remove('active');
      });
    }
  });

  // Start the extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
