const flashcards = [
  {
    id: 'a-thousand-paper-cuts',
    title: 'Death by 1000 paper cuts',
    tags: ['project management']
  },
  {
    id: "move-mountains",
    title: "I moved mountains",
    tags: []
  },
  {
    id: 'sausage-making',
    title: 'The sausage making of ...',
    tags: []
  },
  {
    id: "take-this-offline",
    title: "Let's take this offline",
    tags: []
  },
  {
    id: 'its-a-stretch',
    title: "It's a stretch",
    tags: []
  },
  {
    id: "vanilla-js",
    title: "Vanilla JS",
    tags: []
  },
  {
    id: 'end-of-the-day',
    title: "At the end of the day",
    tags: []
  },
  {
    id: 'cross-to-bear',
    title: "It's my cross to bear",
    tags: []
  },
  {
    id: "true-north",
    title: "True north metrics",
    tags: []
  },
  {
    id: 'in-the-weeds',
    title: "Getting into the weeds",
    tags: []
  },
  {
    id: 'wild-west',
    title: "It's the wild west",
    tags: []
  },
  {
    id: "uphill-battle",
    title: "It's an uphill battle",
    tags: []
  },
  {
    id: "my-beef",
    title: "My beef is that...",
    tags: []
  },
  {
    id: "my-jam",
    title: "That's my jam",
    tags: []
  },
  {
    id: "boil-the-ocean",
    title: "I don't want to boil the ocean",
    tags: []
  },
  {
    id: "wiggle-room",
    title: "There is some wiggle room",
    tags: []
  },
  {
    id: "can-of-worms",
    title: "Open a can of worms",
    tags: []
  },
  {
    id: "fight-gravity",
    title: "Fight gravity",
    tags: []
  }
]


let HTML_before = "<div class='flashcard col-12 col-md-6 col-lg-4'><img src='./flashcards/";
let HTML_after = ".JPG'></div>";
let html = "";

flashcards.forEach((flashcard)=> {
  html = HTML_before + flashcard.id + HTML_after;
  console.log(html);

  $("#gallery").append(HTML_before + flashcard.id + HTML_after);
});
