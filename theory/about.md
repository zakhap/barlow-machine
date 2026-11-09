**TL;DR key**

**The theory**

- **Indispensability** is Barlow's ranking of every pulse in a meter by how much the meter needs it to stay recognizable.
- **Cycle** is one full pass of a rhythm, a loop of equal steps that repeats.
- **Step** is one slot in a cycle that can trigger or stay silent.
- **Strata** are the layers of prime divisions that build a meter, so `2·2·3` is three strata.
- **Rank** is a step's place in the indispensability order, from N−1 for the downbeat down to 0.
- **Weight** is a step's rank scaled between 0 and 1.

**Drawings**

- **Tree** shows the meter as branches, with the whole cycle at the root and the steps as leaves sized by weight.
- **Flower** wraps the cycle into a circle where each petal is a step and its length is the step's weight.
- **Bloom** stacks every rhythm's flower as rings so you can see where they line up.

**Time**

- ==Tempo== sets beats per minute.
- ==Cycle== sets how many beats make one bar.
- ==Length== is one rhythm's own cycle in beats. It can differ from the bar and doesn't have to be whole.
- ==Grid== is steps per beat, so steps equal length times grid.
- ==Steps== sets the step count directly, and the meter then comes from its prime factors.
- **Polymeter** is rhythms of different lengths drifting apart and lining up again at their least common multiple.

**Pattern**

- ==Density== sets how many steps play, turning them on strongest first.
- ==Mode== chooses hits by rank in Barlow mode or spreads them evenly in Euclid mode.
- ==Rotate== slides the hits around the cycle while the meter stays put.
- ==Lock== makes a rhythm avoid or join the hits of the same-length rhythms above it.
- ==Energy== pushes every rhythm's density up or down at once.
- ==Fill== adds more hits while held.

**Feel**

- ==Vel depth== sets how much weight decides loudness, from flat to the downbeat at full and the weakest step at 20%.
- ==Chance== is the probability that any hit plays on a given pass.
- ==Weak drop== makes low-weight steps skip more often than strong ones.
- ==Ghosts== give empty steps a chance of a very quiet hit, louder on stronger steps.
- ==Swing== delays every second step.
- ==Timing== moves each hit early or late by a random few milliseconds.
- ==Vel jitter== varies each hit's loudness at random.

**Motion**

- **Ratchet** splits one hit into several faster, quieter repeats inside its step.
- ==Ratchet== sets how often a ratchet happens, more often on weak steps, and ==Ratchet ×== sets how many repeats.
- ==Spin== rotates the pattern by a few steps at the end of every cycle.
- ==Drift== nudges a rhythm's density, rotation or strata every few cycles.
- ==Drift steps== lets drift also change a rhythm's grid or step count.
- ==Drift== in the header sets how many cycles pass between drift moves.
- ==Mutate== does all of drift at once, with new strata, density, rotation and sometimes mode or lock.

**Sound**

- **Strokes** make conga, bongo and hat play open on strong steps, muted on middle steps and slapped on weak ones.
- **Pitch from weight** moves the note away from the root as weight drops, snapped to a scale.

# a drum machine with a particular theory of time

Clarence is built on one idea about how time divides and how rhythm is felt. In any meter, some pulses matter more than others. Clarence Barlow worked out a method that ranks every pulse of any meter, and he called the ranking indispensability. This page explains where it comes from, how it works, and how each control in the machine uses it to vary a pattern.

> [!figure]
> ![](figs/intro-1.png)
>
> **The Bloom.** Each ring is one rhythm, a whole cycle read clockwise from the top. Petal length is the step's weight, and a filled petal plays.

## Clarence Barlow

Clarence Barlow was a composer and theorist of academic electronic music. He taught for decades and had a strong influence on the California computer music scene, at Berkeley, Stanford, UCSC and UCSD.

While writing rule-based music, Barlow tried to turn musical instinct into rules. The first was a score for *how consonant a harmonic interval is*. There's probably something to build from that too, but I was more interested in the second, **indispensability**. It ranks every pulse in a meter by how much the meter needs that pulse to stay recognizable. At the extreme, the downbeat alone is enough to mark the cycle. In a meter like 5/4, the bar can split as 2+3 or 3+2, and each split changes which pulses the meter can't do without. Barlow published the method in "Two Essays on Theory" in *Computer Music Journal* in 1987.

This browser toy is built on that one formula. The circular layout is a nod to the "time is a flat circle" meme.

## Dividing a cycle

A rhythm in the machine is a **cycle** of equal **steps** that repeats, and a cycle can be divided many ways. Twelve steps can be heard as three groups of four, four groups of three, or two groups of six that each split again. Barlow describes this as a stack of divisions, which is prime factoring by another name. The layers are called **strata**.

Twelve can be written as `2·2·3`, which is three strata. The order of the primes is the meter. `2·2·3` halves the cycle, halves each half, and splits each quarter into three. That's four beats of triplets, a 12/8 feel. `3·2·2` makes three beats of four sixteenths, and it feels like a different rhythm.

> [!figure]
> ![2 · 2 · 3](figs/dividing-a-cycle-1a.png) ![2 · 3 · 2](figs/dividing-a-cycle-1b.png) ![3 · 2 · 2](figs/dividing-a-cycle-1c.png)
>
> **Three meters of the same twelve steps.** The leaves are the twelve steps, sized by weight and ranked underneath. The order of the strata *changes which steps are strong*. The biggest number is the strongest step.

The machine picks the strata from ==Cycle== and ==Grid==. The beats of the cycle are the top strata, and the grid divides each beat below them. Four beats on a grid of 4 gives `2·2·2·2`. Four beats on a grid of 3 gives `2·2·3`. You can reorder the primes yourself, and ==Drift== sometimes reorders them for you.

### Primes larger than three

Barlow gave fixed rankings for 2 and 3. A larger prime is first broken into groups of two with one three at the end, so 5 becomes 2+3 and 7 becomes 2+2+3, and those groups are ranked the same way. That's why a cycle of five steps feels like a short-long pair and seven feels like short-short-long.

> [!figure]
> ![5 = 2+3 · `4 0 3 1 2`](figs/dividing-a-cycle-2a.png) ![7 = 2+2+3 · `6 0 4 1 5 2 3`](figs/dividing-a-cycle-2b.png) ![5 · 2](figs/dividing-a-cycle-2c.png)
>
> **Odd meters.** Petal length is each step's weight and the number is its rank. The downbeat always ranks highest.

## Indispensability

Every step in a cycle of N steps gets its own rank, from N−1 for the most indispensable down to 0. The downbeat always ranks highest. The rest follows from two rules applied one stratum at a time.

- **Coarse pulses keep their order.** When a stratum is added, the pulses that already existed stay above all the new ones, in the same order as before.
- **New pulses rank by where they sit and what comes next.** A new pulse first ranks by its position inside its group, using the small table for that prime. Ties go to the pulse that leads into the stronger coarse pulse.

For two pulses the table is `1 0`, so the downbeat beats the offbeat. For three it is `2 0 1`. The third pulse outranks the second because it leads into the next downbeat. That pull toward the next strong pulse is the center of Barlow's idea, and a small rule does a lot of work here. It explains why the last eighth of a bar of four sounds like it belongs to the next bar.

Four beats as `2·2` ranks `3 0 2 1`. Beat one comes first, then beat three, then beat four because it leads into beat one, and beat two comes last. Sixteen steps as `2·2·2·2` ranks:

`15 0 8 4 12 2 10 6 14 1 9 5 13 3 11 7`

> [!figure]
> ![](figs/indispensability-1.png)
>
> **Sixteen steps, four strata of two.** The quarter notes carry the top four ranks, the eighths the next four, and the sixteenths the rest. Within each layer, the pulse that leads into a stronger one comes first.

The machine scales each rank to a **weight** between 0 and 1. Most of the controls below read that one number.

## Trees and flowers

A rhythm is drawn two ways, as a tree and as a flower. Flower is just a nicer name for a radial diagram.

The **tree** sits at the bottom of each rhythm's card and shows the meter's hierarchy. The root is the whole cycle, each branch point is a stratum, and the leaves are the steps, left to right in time. Leaf size is weight, a filled leaf plays, and clicking a leaf flips it. In Euclid mode the tree gives way to a row of bars showing how loud each hit plays, and either one can be hidden.

The **flower** is the same cycle wrapped into a circle, starting at the top and running clockwise. Each petal is a step and its length is the step's weight, so the empty flower is the shape of the meter. Filled petals play, and brightness is loudness. A petal filled partway plays only some of the time, and the fill shows how often. The Bloom stacks every rhythm's flower as rings so you can see where they line up.

> [!figure]
> ![tree](figs/trees-and-flowers-1a.png) ![flower](figs/trees-and-flowers-1b.png)
>
> **The same rhythm twice.** Twelve steps as `3·2·2` with a density of 5 in 12. The five strongest steps play, and in the flower they're the five longest petals.

## Cycles and time

The clock counts **beats**. ==Tempo== sets beats per minute and ==Cycle== sets how many beats make one bar. Each rhythm then has three numbers of its own.

- ==Length== is the rhythm's cycle in beats. Global follows ==Cycle==. Any other value gives the rhythm its own loop, separate from the bar. Double-click it, or choose Follow the bar, to go back to global.
- ==Grid== is steps per beat, and steps = length × grid. The beat count is the top level of the meter.
- ==Steps== can also be set directly. The steps then spread evenly over the length, and the meter comes from the prime factors of the step count.

### Polymeter

When two rhythms have different lengths they drift against each other, and they line up again after the least common multiple of the two. A 3-beat rhythm against a 4-beat bar meets the bar again every 12 beats. A 6-beat bongo against a 2-beat conga meets it every 6. A length of 8 against 4 gives half time.

> [!figure]
> ![](figs/cycles-and-time-1.png)
>
> **Three against four.** Twelve beats of time. The top rhythm repeats every 4 beats and the lower one every 3. The hairlines mark where each cycle starts, and they only meet at the start, so the combined pattern is 12 beats long. The 4th hit of the 3-beat cycle is the pickup into its next cycle, chosen by indispensability over the other steps it could have landed on.

### Lengths don't have to be whole

A 2½-beat shaker against a five-beat bar plays twice per bar. Against four beats it takes five bars to come back to the top together. Each rhythm keeps its own meter, whatever the others are doing.

## Pattern

### Density

==Density== sets how many steps play. In Barlow mode the machine turns steps on in rank order, so one control gives a family of patterns where each denser one contains every sparser one. At low density you hear only the downbeats. As you turn it up the beats arrive, then the offbeats, then the pickups, which is roughly the order a drummer adds notes when building up. Density is the main control on every rhythm.

> [!figure]
> ![2 / 16](figs/pattern-1a.png) ![4 / 16](figs/pattern-1b.png) ![6 / 16](figs/pattern-1c.png) ![8 / 16](figs/pattern-1d.png)
>
> **Density in Barlow mode.** Each step up adds the next strongest steps. ==Energy== in the header pushes *every* rhythm's density up or down at once, and ==Fill== adds more while held.

### Barlow and Euclid

==Mode== picks how the hits are chosen. Barlow takes the strongest steps. Euclid spreads the same number of hits *as evenly as possible* over the cycle, which produces many traditional bell and clave patterns. Five hits in sixteen, for example, is four beats plus a pickup in Barlow mode and gaps of 4-3-3-3-3 in Euclid mode. Euclid **ignores** the meter when it picks steps, but the meter still sets how loud each hit is.

> [!figure]
> ![Barlow 5/16](figs/pattern-2a.png) ![Euclid 5/16](figs/pattern-2b.png) ![Barlow 7/12](figs/pattern-2c.png) ![Euclid 7/12](figs/pattern-2d.png)
>
> **Barlow on the left, Euclid on the right.** Euclid 7 in 12 is a rotation of the West African bell pattern used in bembé. Barlow 7 in 12 plays the four beats and the triplet notes that lead into three of them.

### Rotate

==Rotate== shifts the pattern around the cycle, but *the meter doesn't move*. The petals keep their lengths, so a hit that was on a strong step lands on a weak one and gets quieter. Rotating changes both where the hits fall and how they're accented.

> [!figure]
> ![rotation 0](figs/pattern-3a.png) ![rotation 1](figs/pattern-3b.png) ![rotation 2](figs/pattern-3c.png) ![rotation 3](figs/pattern-3d.png)
>
> **Rotating a pattern over a fixed meter.** The fills move and the petals stay the same length. Brightness still follows each petal's weight.

### Lock

==Lock== relates a rhythm to the ones above it in the rack. **Avoid** pushes the steps where earlier rhythms already hit to the bottom of the ranking, so the rhythm fills the gaps and the parts interlock. **Join** pulls those steps to the top, so the rhythm doubles what's already there. Lock only compares rhythms with the same length.

> [!figure]
> ![](figs/pattern-4.png)
>
> **Lock against a kick.** With lock off, a second rhythm at the same density lands on the kick. Avoid moves it to *the next strongest free steps*. Join keeps it stacked on the kick's steps.

### Writing steps by hand

Click a petal or a leaf to flip one step. The machine stores your edits relative to the pattern, so they rotate and spin with it. Density follows the number of hits you leave, but it doesn't move the steps you placed.

## Feel

A pattern decides *which steps play*. Feel is *how they play*. Almost every feel control reads a step's weight, so the shape of the meter has an outsized effect on how the pattern sounds.

### Vel depth

==Vel depth== sets how much weight decides loudness. At 0 every hit is equally loud. At 100% the downbeat plays at full volume and the weakest step at 20%. Somewhere in between is where a pattern starts to sound played rather than programmed.

> [!figure]
> ![vel depth 0](figs/feel-1a.png) ![vel depth 50%](figs/feel-1b.png) ![vel depth 100%](figs/feel-1c.png)
>
> **Vel depth.** Fill brightness is loudness.

### Chance and weak drop

==Chance== is the probability that a hit plays on any given pass. ==Weak drop== ties that probability to weight, so the low-weight steps drop out and the downbeat almost never does. Together they keep a dense pattern from sounding like a loop, because no two passes are quite the same. In the flower, a petal filled partway shows how often that step plays.

> [!figure]
> ![always](figs/feel-2a.png) ![chance 70%](figs/feel-2b.png) ![weak drop 80%](figs/feel-2c.png)
>
> **Probability as fill.** Chance shortens every fill by the same amount. Weak drop shortens the low-weight petals the most.

### Ghosts

==Ghosts== give every empty step a chance of a very quiet hit. Ghost notes are the soft strokes between the main ones that make a groove feel alive, and hand drummers play them as heel strokes. The flower shows them as short stubs in the empty petals. A ghost on a heavier petal plays a little louder, so ghosts follow the same accents as everything else.

### Swing and timing

==Swing== delays every second step. A little loosens straight sixteenths, and about 67% is a triplet shuffle. The control stops at 70%.

==Timing== moves each hit early or late by a *random* few milliseconds. ==Vel jitter== does the same for loudness.

> [!figure]
> ![ghost 60%](figs/feel-3a.png) ![swing 60%](figs/feel-3b.png) ![one beat](figs/feel-3c.png)
>
> **Ghosts and timing.** Ghost notes appear as stubs in empty petals. Swing pushes every second petal clockwise. The strip zooms in on one beat of sixteenths.

## Motion

Motion controls change the rhythm while it plays, either inside a step or from one cycle to the next.

### Ratchet

A **ratchet** splits one hit into several faster ones inside its step, each quieter than the last. It's a new stratum of division that shows up for a single step.

==Ratchet== sets how often it happens, and *weak steps ratchet more than strong ones*, so rolls tend to lead into strong beats instead of covering them. ==Ratchet ×== sets how many repeats. 2 doubles the step and 3 turns it into a triplet.

> [!figure]
> ![ratchets on three steps](figs/motion-1a.png) ![the same bar in time](figs/motion-1b.png)
>
> **Ratchets.** Each repeat is shorter and quieter than the one before.

### Spin

==Spin== rotates the pattern by a few steps at the end of every cycle. A spinning pattern moves through all its rotations and comes back, passing over different accents each time. A spinning copy against the original gives Steve Reich's *phasing*.

The Phase preset does this with the figure from *Clapping Music*.

> [!figure]
> ![](figs/motion-2.png)
>
> **Spin +1 for five cycles.** The Clapping Music figure moves one step later each cycle. The meter stays put, so each hit's loudness changes as it moves.

### Drift

==Drift== lets a rhythm wander. Every few cycles it nudges density up or down, sometimes rotates a step, and sometimes reorders its strata. With ==Drift steps== on, it can also change its grid or step count. ==Drift== in the header sets how many cycles pass between moves.

> [!figure]
> ![start](figs/motion-3a.png) ![denser](figs/motion-3b.png) ![rotated](figs/motion-3c.png) ![strata 3·2·2](figs/motion-3d.png) ![sparser](figs/motion-3e.png)
>
> **Four drift moves.** One rhythm wandering over several drift points.

==Mutate== is all of drift at once. It picks new strata, density and rotation, and sometimes a new mode or lock. <kbd>M</kbd> mutates everything, and <kbd>⇧Q</kbd> to <kbd>⇧I</kbd> mutate one rhythm, which is handy when playing live.

## Sound from weight

Instruments are separate from rhythms, and any rhythm can play any instrument. The instruments sit below the rhythms.

Some instrument controls also read the weight of the step being played.

- **Strokes.** Conga, bongo and hat change how they're struck. Strong steps play open, middle steps muted and weak steps slapped, so one pattern gets a hand drummer's range of tones.
- **Pitch from weight.** The pitch moves away from the base note as weight drops, snapped to a scale. Strong steps sit on the root and weak steps wander, so the melody follows the meter.
- **Pitch from velocity, step or random.** Loudness, position in the cycle, or a random number moves the pitch instead.
