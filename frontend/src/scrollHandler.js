// Add scroll event listeners to show/hide scrollbars
export const addScrollHandler = (element) => {
  let scrollTimeout;
  
  const showScrollbar = () => {
    element.classList.add('scrolling');
  };
  
  const hideScrollbar = () => {
    element.classList.remove('scrolling');
  };
  
  element.addEventListener('scroll', () => {
    showScrollbar();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(hideScrollbar, 1000);
  });
  
  // Also show on mouse enter
  element.addEventListener('mouseenter', showScrollbar);
  element.addEventListener('mouseleave', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(hideScrollbar, 500);
  });
};