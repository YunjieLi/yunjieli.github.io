const gradient = Array.from(document.querySelectorAll("stop"), (stop, index) => ({
  stop,
  colors: [
    stop.getAttribute("stop-color").match(/\d+/g).map(Number),
    index ? [255, 255, 120] : [20, 230, 100]
  ]
}));

animate({
  easing: "out-quartic",
  duration: 4000,
  loop: true,
  change: progress =>
    gradient.forEach(({stop, colors}) => {
      const [from, to] = colors;
      const [r, g, b] = from.map((value, index) =>
        Math.round(value + progress * (to[index] - value)));
      stop.setAttribute("stop-color", `rgb(${r}, ${g}, ${b})`);
      if (progress == 1) colors.reverse();
    })
});