
document.addEventListener('DOMContentLoaded', function() {
  new Splide('.splide', {
    type: 'loop',
    perPage: 5,
    autoplay: true,
    interval: 4000,
    breakpoints: {
      640: {
        perPage: 2,
        gap: '.7rem',
        height: '6rem',
      },
      480: {
        perPage: 1,
        gap: '.7rem',
        height: '6rem',
      },
    },
  }).mount();
});