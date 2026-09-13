document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------
     Sticky nav shrink on scroll
  --------------------------------------------------- */
  var nav = document.getElementById('siteNav');
  var lastState = false;
  function onScrollNav() {
    var scrolled = window.scrollY > 40;
    if (scrolled !== lastState) {
      nav.classList.toggle('scrolled', scrolled);
      lastState = scrolled;
    }
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------- */
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobilePanel');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('open');
      panel.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------
     Scroll-reveal via IntersectionObserver
  --------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------------------------------------------
     Count-up numbers (hero + stats strip)
  --------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------------------------------------------------
     Scrollspy: highlight active nav link
  --------------------------------------------------- */
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  function onScrollSpy() {
    var scrollPos = window.scrollY + 140;
    var currentId = null;
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active-link', a.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  /* ---------------------------------------------------
     Inquiry & Booking Form handling with interactive feedback & WhatsApp
  --------------------------------------------------- */
  var inquiryForm = document.getElementById('hotelInquiryForm');
  var inquiryCard = document.getElementById('inquiryCard');
  var inquirySuccess = document.getElementById('inquirySuccess');
  var resetInquiryBtn = document.getElementById('resetInquiryBtn');
  var inqCheckIn = document.getElementById('inqCheckIn');
  var inqCheckOut = document.getElementById('inqCheckOut');
  var inqPackage = document.getElementById('inqPackage');

  // Set default minimum dates
  if (inqCheckIn && inqCheckOut) {
    var today = new Date().toISOString().split('T')[0];
    inqCheckIn.min = today;
    
    // Default check-in to today, check-out to tomorrow
    var tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    var tomorrow = tomorrowDate.toISOString().split('T')[0];
    inqCheckIn.value = today;
    inqCheckOut.min = tomorrow;
    inqCheckOut.value = tomorrow;

    inqCheckIn.addEventListener('change', function () {
      if (inqCheckIn.value) {
        var selectedCheckIn = new Date(inqCheckIn.value);
        var nextDay = new Date(selectedCheckIn);
        nextDay.setDate(nextDay.getDate() + 1);
        var nextDayStr = nextDay.toISOString().split('T')[0];
        inqCheckOut.min = nextDayStr;
        if (!inqCheckOut.value || inqCheckOut.value <= inqCheckIn.value) {
          inqCheckOut.value = nextDayStr;
        }
      }
    });
  }

  // Handle all "Select / Book Package" buttons across the site
  document.querySelectorAll('.select-package-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var pkgName = btn.getAttribute('data-package');
      if (pkgName && inqPackage) {
        // Find matching option in select
        for (var i = 0; i < inqPackage.options.length; i++) {
          if (inqPackage.options[i].value === pkgName || inqPackage.options[i].text.indexOf(pkgName) !== -1) {
            inqPackage.selectedIndex = i;
            break;
          }
        }
      }

      // Smooth scroll to inquiry form
      var inqSection = document.getElementById('inquiry');
      if (inqSection) {
        setTimeout(function () {
          inqSection.scrollIntoView({ behavior: 'smooth' });
          if (inquiryCard) {
            inquiryCard.classList.add('highlight-focus');
            setTimeout(function () {
              inquiryCard.classList.remove('highlight-focus');
            }, 1800);
          }
        }, 100);
      }
    });
  });

  // Handle Inquiry Form Submit
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!inquiryForm.checkValidity()) {
        inquiryForm.reportValidity();
        return;
      }

      var name = document.getElementById('inqName').value.trim();
      var phone = document.getElementById('inqPhone').value.trim();
      var email = document.getElementById('inqEmail').value.trim();
      var selectedPackage = inqPackage ? inqPackage.value : 'Standard Stay';
      var checkIn = inqCheckIn ? inqCheckIn.value : '';
      var checkOut = inqCheckOut ? inqCheckOut.value : '';
      var guests = document.getElementById('inqGuests').value;
      var message = document.getElementById('inqMessage').value.trim();

      // Collect add-ons
      var selectedAddons = [];
      inquiryForm.querySelectorAll('input[name="addons"]:checked').forEach(function (cb) {
        selectedAddons.push(cb.value);
      });

      // Populate Success Modal / Container
      var successNameEl = document.getElementById('successGuestName');
      var successPkgEl = document.getElementById('successPackage');
      var successDatesEl = document.getElementById('successDates');
      var successGuestsEl = document.getElementById('successGuests');
      var successContactEl = document.getElementById('successContact');
      var whatsAppLinkEl = document.getElementById('successWhatsAppLink');

      if (successNameEl) successNameEl.textContent = name;
      if (successPkgEl) successPkgEl.textContent = selectedPackage;
      if (successDatesEl) successDatesEl.textContent = (checkIn || 'TBD') + ' to ' + (checkOut || 'TBD');
      if (successGuestsEl) successGuestsEl.textContent = guests;
      if (successContactEl) successContactEl.textContent = phone + ' (' + email + ')';

      // Build customized WhatsApp URL
      if (whatsAppLinkEl) {
        var waText = 'Namaste Horizon Inn,\n' +
          'I just submitted an inquiry on your website:\n\n' +
          '• Guest: ' + name + '\n' +
          '• Package: ' + selectedPackage + '\n' +
          '• Check-in: ' + checkIn + '\n' +
          '• Check-out: ' + checkOut + '\n' +
          '• Guests: ' + guests + '\n' +
          '• Phone: ' + phone + '\n' +
          (selectedAddons.length ? ('• Preferences: ' + selectedAddons.join(', ') + '\n') : '') +
          (message ? ('• Note: ' + message + '\n') : '') +
          '\nPlease confirm availability for these dates. Thank you!';
        whatsAppLinkEl.href = 'https://wa.me/9779713545254?text=' + encodeURIComponent(waText);
      }

      // Show confirmation state
      inquiryForm.classList.add('d-none');
      if (inquirySuccess) {
        inquirySuccess.classList.remove('d-none');
      }

      if (inquiryCard) {
        inquiryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Handle "Send Another Inquiry"
  if (resetInquiryBtn && inquiryForm && inquirySuccess) {
    resetInquiryBtn.addEventListener('click', function () {
      inquiryForm.reset();
      // Reset dates
      if (inqCheckIn && inqCheckOut) {
        var today = new Date().toISOString().split('T')[0];
        inqCheckIn.value = today;
        var tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        inqCheckOut.value = tomorrowDate.toISOString().split('T')[0];
      }
      inquirySuccess.classList.add('d-none');
      inquiryForm.classList.remove('d-none');
    });
  }

});

/* ---------------------------------------------------
   Inquiry form handler (outside DOMContentLoaded so
   it's available as a global for the inline onsubmit)
--------------------------------------------------- */
function handleInquirySubmit(e) {
  e.preventDefault();
  var btn = document.getElementById('inquirySubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  // Simulate a short network delay then show success
  setTimeout(function () {
    document.getElementById('inquiryForm').style.display = 'none';
    document.getElementById('inquirySuccess').style.display = 'flex';
  }, 1200);
}

// Set min date on check-in field to today
document.addEventListener('DOMContentLoaded', function () {
  var checkinField = document.getElementById('inqCheckin');
  if (checkinField) {
    checkinField.min = new Date().toISOString().split('T')[0];
  }
});

/* ---------------------------------------------------
   Package selection helper
--------------------------------------------------- */
function selectPackage(pkgVal) {
  var pkgSelect = document.getElementById('inqPackage');
  if (pkgSelect && pkgVal) {
    pkgSelect.value = pkgVal;
  }
}