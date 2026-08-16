"""Builds public/data/catalog.json from books.json + hand-authored metadata.
Run: python3 scripts/build-catalog.py
"""
import json, re, hashlib

SRC = 'public/data/books.json'
OUT = 'public/data/catalog.json'

def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip('-')
    return s[:60]

def h(s, n):
    return int(hashlib.md5(s.encode()).hexdigest(), 16) % n

# ---- hand-authored metadata for well-known works ------------------------------------
RICH = {
 "The Hunger Games": dict(fs="When I wake up, the other side of the bed is cold.", subjects=["Dystopian fiction","Young adult","Survival","Panem"],
   desc="In the ruins of a place once known as North America lies the nation of Panem, a shining Capitol surrounded by twelve outlying districts. Each year the Capitol forces each district to send one boy and one girl to fight to the death on live television. Sixteen-year-old Katniss Everdeen volunteers in her sister's place."),
 "Catching Fire": dict(fs="I clasp the flask between my hands even though the warmth from the tea has long since leached into the frozen air.", subjects=["Dystopian fiction","Young adult","Rebellion"],
   desc="Katniss Everdeen has won the Hunger Games and returned home to District 12 — but the Capitol is angry, rumours of rebellion are spreading, and the 75th Games bring a twist no victor saw coming."),
 "Mockingjay": dict(fs="I stare down at my shoes, watching as a fine layer of ash settles on the worn leather.", subjects=["Dystopian fiction","Young adult","War"],
   desc="District 12 is gone. Katniss is in District 13, and the rebellion wants her to be the Mockingjay — the symbol of a revolution she never chose to lead."),
 "The Ballad of Songbirds and Snakes": dict(fs="Coriolanus released the fistful of cabbage into the pot of boiling water and swore that one day it would never pass his lips again.", subjects=["Dystopian fiction","Young adult","Prequels"],
   desc="It is the morning of the reaping that will kick off the tenth annual Hunger Games. Eighteen-year-old Coriolanus Snow is preparing for his one shot at glory as a mentor — assigned the girl tribute from lowly District 12."),
 "Sunrise on the Reaping": dict(fs="Happy birthday to me.", subjects=["Dystopian fiction","Young adult","Prequels"],
   desc="The morning of the reaping for the 50th Hunger Games — the Second Quarter Quell — dawns in District 12, and Haymitch Abernathy is trying not to think about the day ahead."),
 "Pride and Prejudice": dict(fs="It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", subjects=["Fiction","Romance","England","Social classes"],
   desc="Elizabeth Bennet, second of five sisters in a family of modest means, meets the proud and wealthy Mr. Darcy — and misjudges him as thoroughly as he misjudges her."),
 "Sense and Sensibility": dict(fs="The family of Dashwood had long been settled in Sussex.", subjects=["Fiction","Romance","England","Sisters"],
   desc="When Mr. Dashwood dies, his wife and three daughters are left with almost nothing. Elinor's sense and Marianne's sensibility are tested by two very different suitors."),
 "Emma": dict(fs="Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence.", subjects=["Fiction","Romance","England","Matchmaking"],
   desc="Emma Woodhouse, convinced of her talent for matchmaking, meddles in the romantic lives of everyone around her — with consequences she never sees coming."),
 "Jane Eyre": dict(fs="There was no possibility of taking a walk that day.", subjects=["Fiction","Gothic fiction","Governesses","England"],
   desc="Orphaned and unloved, Jane Eyre grows up to become a governess at Thornfield Hall, where she falls in love with the brooding Mr. Rochester — who is hiding a terrible secret."),
 "Wuthering Heights": dict(fs="1801. — I have just returned from a visit to my landlord — the solitary neighbour that I shall be troubled with.", subjects=["Fiction","Gothic fiction","Yorkshire","Revenge"],
   desc="On the wild Yorkshire moors, the foundling Heathcliff and Catherine Earnshaw form a bond that outlasts marriage, death and a generation of revenge."),
 "Great Expectations": dict(fs="My father's family name being Pirrip, and my Christian name Philip, my infant tongue could make of both names nothing longer or more explicit than Pip.", subjects=["Fiction","Bildungsroman","England","Orphans"],
   desc="Pip, an orphan raised by his sister in the Kent marshes, is lifted into gentility by an anonymous benefactor — and slowly learns what his great expectations have cost."),
 "A Tale of Two Cities": dict(fs="It was the best of times, it was the worst of times.", subjects=["Fiction","Historical fiction","French Revolution","London","Paris"],
   desc="Against the backdrop of the French Revolution, Charles Darnay and Sydney Carton — two men who look alike and love the same woman — are drawn toward the guillotine."),
 "Oliver Twist": dict(fs="Among other public buildings in a certain town, which for many reasons it will be prudent to refrain from mentioning, there is one anciently common to most towns, great or small: to wit, a workhouse.", subjects=["Fiction","Orphans","London","Crime"],
   desc="Born in a workhouse and sold into apprenticeship, Oliver Twist escapes to London and falls in with a gang of child pickpockets run by the Artful Dodger and Fagin."),
 "A Christmas Carol": dict(fs="Marley was dead: to begin with.", subjects=["Fiction","Christmas","Ghosts","London"],
   desc="Ebenezer Scrooge, a miser who despises Christmas, is visited by the ghost of his partner and three spirits who show him his past, present and the future that awaits him."),
 "Moby Dick": dict(fs="Call me Ishmael.", subjects=["Fiction","Whaling","Sea stories","Obsession"],
   desc="Ishmael signs aboard the Pequod, a whaling ship commanded by Captain Ahab, who is consumed by his hunt for the white whale that took his leg."),
 "The Great Gatsby": dict(fs="In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.", subjects=["Fiction","Jazz Age","Long Island","American Dream"],
   desc="Nick Carraway rents a cottage on Long Island next to the mansion of Jay Gatsby, a mysterious millionaire who throws lavish parties in the hope that Daisy Buchanan will one day walk in."),
 "To Kill a Mockingbird": dict(fs="When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow.", subjects=["Fiction","Racism","Alabama","Coming of age"],
   desc="Scout Finch grows up in Depression-era Alabama while her father, Atticus, defends a Black man falsely accused of assaulting a white woman."),
 "The Catcher in the Rye": dict(fs="If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like.", subjects=["Fiction","Adolescence","New York"],
   desc="Expelled from prep school, sixteen-year-old Holden Caulfield spends three days wandering New York City, railing against phoniness and mourning a loss he can't name."),
 "Little Women": dict(fs="\"Christmas won't be Christmas without any presents,\" grumbled Jo, lying on the rug.", subjects=["Fiction","Sisters","Massachusetts","Coming of age"],
   desc="Meg, Jo, Beth and Amy March grow from girlhood to womanhood in Civil War-era New England, guided by their mother while their father is away at war."),
 "Frankenstein": dict(fs="You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings.", subjects=["Gothic fiction","Horror","Science fiction","Monsters"],
   desc="Victor Frankenstein, a young scientist, creates a sapient creature in an unorthodox experiment — and is destroyed by what he brings to life."),
 "Dracula": dict(fs="3 May. Bistritz.—Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning.", subjects=["Gothic fiction","Horror","Vampires","Transylvania"],
   desc="Jonathan Harker travels to Transylvania to help Count Dracula buy a house in England, and unwittingly helps a vampire loose upon London."),
 "The Picture of Dorian Gray": dict(fs="The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac.", subjects=["Fiction","Gothic fiction","Aestheticism","London"],
   desc="Dorian Gray wishes his portrait would age instead of him. It does — and every sin he commits is recorded on the canvas while his face stays young."),
 "Alice's Adventures in Wonderland": dict(fs="Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.", subjects=["Fantasy","Children's fiction","Nonsense"],
   desc="Alice follows a white rabbit down a hole into a world of talking animals, mad tea parties, and a queen who wants everyone's head."),
 "The Book Thief": dict(fs="First the colours. Then the humans. That's usually how I see things. Or at least, how I try.", subjects=["Historical fiction","World War II","Germany","Books and reading"],
   desc="Narrated by Death, the story of Liesel Meminger, a foster girl in Nazi Germany who steals books and shares them with the Jewish man hidden in her basement."),
 "It": dict(fs="The terror, which would not end for another twenty-eight years — if it ever did end — began, so far as I know or can tell, with a boat made from a sheet of newspaper floating down a gutter swollen with rain.", subjects=["Horror","Maine","Childhood","Clowns"],
   desc="Seven children in Derry, Maine, confront a shape-shifting evil that hides in the sewers — and, twenty-seven years later, must return as adults to finish it."),
 "The Shining": dict(fs="Jack Torrance thought: Officious little prick.", subjects=["Horror","Hotels","Colorado","Isolation"],
   desc="Jack Torrance takes a job as winter caretaker of the Overlook Hotel, bringing his wife and his psychically gifted son — and the hotel begins to work on him."),
 "The Stand": dict(fs="Sally.", subjects=["Horror","Post-apocalyptic","Pandemics","Good and evil"],
   desc="A weaponised flu escapes a lab and kills almost everyone. The survivors dream of two figures — an old woman in Nebraska and a dark man in Las Vegas — and choose sides."),
 "Thinner": dict(fs="\"Thinner,\" the old Gypsy man with the rotting nose whispers to William Halleck as Halleck and his wife, Heidi, come out of the courthouse.", subjects=["Horror","Curses","Connecticut"],
   desc="After an overweight lawyer kills an old woman in a hit-and-run and walks free, her father whispers a single word to him — and he begins to lose weight, and keeps losing."),
 "Atomic Habits: The life-changing million-copy #1 bestseller": dict(fs="On the final day of my sophomore year of high school, I was hit in the face with a baseball bat.", subjects=["Self-help","Habits","Psychology","Productivity"],
   desc="A practical framework for building good habits and breaking bad ones, built on the idea that tiny changes compound into remarkable results."),
 "Beloved": dict(fs="124 was spiteful. Full of a baby's venom.", subjects=["Fiction","Historical fiction","Slavery","Ohio"],
   desc="Sethe, an escaped slave living in post-Civil-War Ohio, is haunted by the ghost of the daughter she killed rather than see returned to slavery — until a young woman calling herself Beloved arrives at her door."),
 "Nineteen Eighty-Four": dict(fs="It was a bright cold day in April, and the clocks were striking thirteen.", subjects=["Dystopian fiction","Totalitarianism","Surveillance"],
   desc="Winston Smith works at the Ministry of Truth rewriting history for the Party. Then he falls in love, and starts to think for himself."),
 "Animal Farm": dict(fs="Mr. Jones, of the Manor Farm, had locked the hen-houses for the night, but was too drunk to remember to shut the pop-holes.", subjects=["Political satire","Allegory","Animals"],
   desc="The animals of Manor Farm overthrow their farmer and set up a society of equals — until the pigs start walking on two legs."),
 "Brave New World": dict(fs="A squat grey building of only thirty-four stories.", subjects=["Dystopian fiction","Science fiction","Genetic engineering"],
   desc="In a World State where citizens are grown in bottles and kept happy with soma, Bernard Marx begins to feel that something is missing."),
 "Fahrenheit 451": dict(fs="It was a pleasure to burn.", subjects=["Dystopian fiction","Science fiction","Censorship","Books and reading"],
   desc="Guy Montag is a fireman whose job is to burn books. Then he meets a girl who asks him whether he is happy."),
 "The Handmaid's Tale": dict(fs="We slept in what had once been the gymnasium.", subjects=["Dystopian fiction","Feminism","Theocracy"],
   desc="In the Republic of Gilead, Offred is a Handmaid — valued only for her ovaries — who remembers a time when she had a name, a job and a daughter."),
 "Dune": dict(fs="In the week before their departure to Arrakis, when all the final scurrying about had reached a nearly unbearable frenzy, an old crone came to visit the mother of the boy, Paul.", subjects=["Science fiction","Space opera","Desert planets","Politics"],
   desc="Paul Atreides, heir to a noble house, moves with his family to the desert planet Arrakis — the only source of the spice melange — and into a trap set by their enemies."),
 "The Hobbit": dict(fs="In a hole in the ground there lived a hobbit.", subjects=["Fantasy","Dragons","Quests","Middle-earth"],
   desc="Bilbo Baggins, a comfortable hobbit, is talked by the wizard Gandalf into joining thirteen dwarves on a quest to reclaim their treasure from the dragon Smaug."),
 "The Lord of the Rings": dict(fs="When Mr. Bilbo Baggins of Bag End announced that he would shortly be celebrating his eleventy-first birthday with a party of special magnificence, there was much talk and excitement in Hobbiton.", subjects=["Fantasy","Quests","Middle-earth","Good and evil"],
   desc="Frodo Baggins inherits a ring of terrible power and sets out with eight companions to destroy it in the fires of Mount Doom."),
 "Ender's Game": dict(fs="\"I've watched through his eyes, I've listened through his ears, and I tell you he's the one.\"", subjects=["Science fiction","Military","Children","Aliens"],
   desc="Six-year-old Ender Wiggin is taken to Battle School to be trained as a commander in humanity's war against an alien species."),
 "Neuromancer": dict(fs="The sky above the port was the color of television, tuned to a dead channel.", subjects=["Science fiction","Cyberpunk","Artificial intelligence","Hackers"],
   desc="Case, a washed-up hacker, is hired for one last job by a mysterious employer — and finds himself working for an artificial intelligence with plans of its own."),
 "The Hitchhiker's Guide to the Galaxy": dict(fs="Far out in the uncharted backwaters of the unfashionable end of the western spiral arm of the Galaxy lies a small unregarded yellow sun.", subjects=["Science fiction","Humor","Space travel"],
   desc="Seconds before Earth is demolished to make way for a hyperspace bypass, Arthur Dent is rescued by his friend Ford Prefect, a researcher for the Guide."),
 "Good Omens": dict(fs="It was a nice day.", subjects=["Fantasy","Humor","Apocalypse","Angels and demons"],
   desc="An angel and a demon who have grown rather fond of Earth team up to prevent the Apocalypse — if only they could find the Antichrist."),
 "American Gods": dict(fs="Shadow had done three years in prison.", subjects=["Fantasy","Mythology","Road trips","United States"],
   desc="Fresh out of prison, Shadow takes a job as bodyguard to the mysterious Mr. Wednesday and is drawn into a war between the old gods and the new."),
 "Project Hail Mary": dict(fs="\"What's two plus two?\"", subjects=["Science fiction","Space","Astronauts","First contact"],
   desc="Ryland Grace wakes up alone on a spaceship with no memory of who he is or why he's there. He has to remember, because the fate of the Earth depends on it."),
 "Gone Girl": dict(fs="When I think of my wife, I always think of her head.", subjects=["Thriller","Marriage","Missing persons","Missouri"],
   desc="On their fifth wedding anniversary, Amy Dunne disappears. Her husband Nick becomes the prime suspect — and the story is told by both of them."),
 "Where the Crawdads Sing": dict(fs="Marsh is not swamp.", subjects=["Fiction","North Carolina","Nature","Mystery"],
   desc="Kya Clark, abandoned as a child, raises herself in the marshes of North Carolina — and years later is accused of murdering a young man from town."),
 "Circe": dict(fs="When I was born, the name for what I was did not exist.", subjects=["Fantasy","Mythology","Greek gods","Witches"],
   desc="Circe, daughter of the sun god Helios, is banished to a deserted island where she hones her witchcraft and crosses paths with Odysseus."),
 "The Song of Achilles": dict(fs="My father was a king and the son of kings.", subjects=["Fiction","Mythology","Trojan War","Love stories"],
   desc="Patroclus, an awkward young prince exiled to Phthia, befriends the golden Achilles — and follows him to Troy."),
 "Pachinko": dict(fs="History has failed us, but no matter.", subjects=["Historical fiction","Korea","Japan","Family saga"],
   desc="Four generations of a Korean family in Japan, from a boarding house in Busan to the pachinko parlours of Osaka, bound by love, sacrifice and the long shadow of exile."),
 "Educated": dict(fs="My strongest memory is not a memory.", subjects=["Memoir","Education","Idaho","Family"],
   desc="Born to survivalists in the mountains of Idaho, Tara Westover never set foot in a classroom until she taught herself enough to get into university."),
 "Sapiens": dict(fs="About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang.", subjects=["History","Anthropology","Human evolution"],
   desc="How Homo sapiens came to dominate the planet — through the cognitive, agricultural and scientific revolutions."),
 "The Road": dict(fs="When he woke in the woods in the dark and the cold of the night he'd reach out to touch the child sleeping beside him.", subjects=["Fiction","Post-apocalyptic","Fathers and sons"],
   desc="A father and his young son walk south through a burned America, carrying a pistol and pushing a shopping cart with everything they own."),
 "The Alchemist": dict(fs="The boy's name was Santiago.", subjects=["Fiction","Quests","Spirituality","Shepherds"],
   desc="Santiago, an Andalusian shepherd, dreams of treasure at the Egyptian pyramids and sets out to find it."),
 "Slaughterhouse-Five": dict(fs="All this happened, more or less.", subjects=["Fiction","World War II","Time travel","Dresden"],
   desc="Billy Pilgrim has come unstuck in time. He survives the firebombing of Dresden, is abducted by aliens, and lives his life out of order."),
 "Catch-22": dict(fs="It was love at first sight.", subjects=["Fiction","World War II","Satire","Bureaucracy"],
   desc="Captain Yossarian wants out of the war. But anyone who wants out must be sane, and anyone sane must fly — that's the catch."),
 "The Grapes of Wrath": dict(fs="To the red country and part of the gray country of Oklahoma, the last rains came gently, and they did not cut the scarred earth.", subjects=["Fiction","Great Depression","Migrant workers","California"],
   desc="Driven from their Oklahoma farm by drought and debt, the Joad family joins the migration west to California."),
 "Of Mice and Men": dict(fs="A few miles south of Soledad, the Salinas River drops in close to the hillside bank and runs deep and green.", subjects=["Fiction","Great Depression","Friendship","California"],
   desc="George and Lennie, two migrant workers, dream of owning a piece of land. Then they take a job on a ranch near Soledad."),
 "The Bell Jar": dict(fs="It was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn't know what I was doing in New York.", subjects=["Fiction","Mental illness","New York","Women"],
   desc="Esther Greenwood, a talented young woman on a magazine internship in New York, feels herself sliding under a bell jar."),
 "One Hundred Years of Solitude": dict(fs="Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.", subjects=["Fiction","Magic realism","Colombia","Family saga"],
   desc="Seven generations of the Buendía family in the town of Macondo, from its founding to its end."),
 "Anna Karenina": dict(fs="Happy families are all alike; every unhappy family is unhappy in its own way.", subjects=["Fiction","Russia","Adultery","Aristocracy"],
   desc="Anna Karenina, married to a senior official, falls in love with the dashing Count Vronsky and defies Russian society to be with him."),
 "Crime and Punishment": dict(fs="On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge.", subjects=["Fiction","Russia","Murder","Guilt"],
   desc="Raskolnikov, a destitute former student, murders a pawnbroker to prove a theory — and is undone by his conscience."),
 "The Metamorphosis": dict(fs="As Gregor Samsa awoke one morning from uneasy dreams he found himself transformed in his bed into a gigantic insect.", subjects=["Fiction","Absurdist fiction","Family","Alienation"],
   desc="Gregor Samsa, a travelling salesman, wakes up as an insect. His family adjusts."),
 "The Little Prince": dict(fs="Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest.", subjects=["Fiction","Children's fiction","Philosophy","Aviators"],
   desc="A pilot stranded in the Sahara meets a small boy from a tiny asteroid, who tells him about the planets he has visited and the rose he left behind."),
 "The Hound of the Baskervilles": dict(fs="Mr. Sherlock Holmes, who was usually very late in the mornings, save upon those not infrequent occasions when he was up all night, was seated at the breakfast table.", subjects=["Detective fiction","Sherlock Holmes","Dartmoor","Mystery"],
   desc="Sherlock Holmes and Dr. Watson investigate the death of Sir Charles Baskerville, and the legend of a spectral hound that haunts his family."),
 "Murder on the Orient Express": dict(fs="It was five o'clock on a winter's morning in Syria.", subjects=["Detective fiction","Hercule Poirot","Trains","Mystery"],
   desc="A snowdrift stops the Orient Express, and in the morning a passenger is found stabbed to death. Hercule Poirot is on board."),
 "And Then There Were None": dict(fs="In the corner of a first-class smoking carriage, Mr. Justice Wargrave, lately retired from the bench, puffed at a cigar and ran an interested eye through the political news in the Times.", subjects=["Detective fiction","Mystery","Islands","Nursery rhymes"],
   desc="Ten strangers are lured to an island off the Devon coast, and one by one they die, according to the words of a nursery rhyme."),
 "Death on the Nile": dict(fs="Linnet Ridgeway!", subjects=["Detective fiction","Hercule Poirot","Egypt","Mystery"],
   desc="On a cruise up the Nile, a wealthy heiress is shot dead in her cabin. Hercule Poirot, on holiday, must find the killer before the boat docks."),
 "The Goldfinch": dict(fs="While I was still in Amsterdam, I dreamed about my mother for the first time in years.", subjects=["Fiction","Coming of age","Art theft","New York"],
   desc="Theo Decker, thirteen, survives an explosion at the Met that kills his mother, and walks out with a small Dutch painting that will shape the rest of his life."),
}

# books.json cover ids that point at the wrong work — use ISBN covers (404 → placeholder)
ISBN_COVERS = {"Mockingjay":"9780439023511","The Book Thief":"9780375842207","The Hunger Games":"9780439023481","Catching Fire":"9780439023498"}

# ---- lending states ---------------------------------------------------------------------
STATES_MODERN = ['borrowable','borrowable','borrowable','borrowable','waitlist','checkedout','preview_only','none','none','none','borrowable','preview_only']
STATES_OLD    = ['open','open','open','partner','partner','borrowable','open','partner','none','open']
PROVIDERS = ['Project Gutenberg','Standard Ebooks','Wikisource','LibriVox']

def build():
    src = json.load(open(SRC))
    src.append({"title":"The Goldfinch","author":"Donna Tartt","coverUrl":"https://covers.openlibrary.org/b/id/7884297-L.jpg","firstPublished":2013,"status":"borrow"})
    out = []
    seen = set()
    for b in src:
        title = b['title']; key = slug(title)
        if key in seen: continue
        seen.add(key)
        rich = RICH.get(title, {})
        year = b['firstPublished']
        old = year < 1928
        seed = key
        if b['status'] == 'locate' and not rich: ls = 'none'
        else: ls = (STATES_OLD if old else STATES_MODERN)[h(seed+'ls', len(STATES_OLD if old else STATES_MODERN))]
        book = {
            'key': key,
            'title': title,
            'author': b['author'],
            'authorKey': slug(b['author']),
            'year': year,
            'coverUrl': b['coverUrl'],
            'rating': round((3.8 + h(seed+'r', 9) / 10) if rich else (3.2 + h(seed+'r', 10) / 10), 1),
            'ratingCount': (400 + h(seed+'rc', 5000)) if rich else (20 + h(seed+'rc', 400)),
            'editions': 3 + h(seed+'e', 60) if not old else 20 + h(seed+'e', 380),
            'ebooks': 0,
            'pages': 160 + h(seed+'p', 700),
            'lendingState': ls,
            'firstSentence': rich.get('fs'),
            'description': rich.get('desc'),
            'subjects': rich.get('subjects') or (['Classics','Fiction'] if old else ['Fiction']),
        }
        if ls in ('borrowable','open','waitlist','checkedout','preview_only','partner'):
            book['ebooks'] = 1 + h(seed+'eb', 12)
        if ls == 'borrowable':
            m = 1 + h(seed+'m', 3); n = 1 + h(seed+'n', m)
            book['copies'] = [n, m]
        if ls == 'waitlist': book['queue'] = 1 + h(seed+'q', 9)
        if ls == 'partner': book['provider'] = PROVIDERS[h(seed+'pv', len(PROVIDERS))]
        if ls == 'none': book['hasIdentifiers'] = h(seed+'id', 10) != 0   # ~10% have no ISBN/OCLC
        if title in ISBN_COVERS: book['coverUrl'] = f"https://covers.openlibrary.org/b/isbn/{ISBN_COVERS[title]}-L.jpg?default=false"
        out.append(book)
    json.dump(out, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(len(out), 'books;', sum(1 for b in out if b['description']), 'with descriptions')

if __name__ == '__main__':
    build()
