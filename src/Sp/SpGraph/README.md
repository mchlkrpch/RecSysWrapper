# Space Graph Guide

**definitions:**
- CI - conscious information
- G - information graph
- E - elementary information unit (_without links to  prerequisite information_): facts (EF) (_it's raining_), elementary objects (EO) (number 20 or letter 'a')
- T = $\{t_i\}$ - logic transitions that $T: \mathcal{P}(E) -> \mathcal{P}(E)$
- Information closure - an information closure is a stable information configuration that can be realized by referring only to objects from this closure.

Editor
- Partitioning - the disjunctive division of E
- Namespace - context for node in editor ($=\mathcal{P}(E)$) nodes that can be mentioned in this node


**Core assumptions**
- The whole CI is represented through a set of E, their combinations and a causal relationship: transitions T.
- For humans, there is an information closure for the subjects studied in schools, colleges, institutes, and higher educational institutions.
- A person knows the material better if:
	-	knows a larger percentage of E,T inside information closure
	- Sees the manifestation of a special case of the logical transition \{t_i\} and back: a more general transition
	- Does first items of the list faster
- A person remembers better
	- if he repeats the material in the correct order.
	- Repeats the material by increasing the time distance

**Usage format assumptions**
- G's Partitioning helps the user navigate through the material faster: create additional Views on G, understand the order of passing the material.

**G repeat**
- raiting of nodes - f(x), where f is forgetting curve
- curve's slope continuously decreases during time goes. and it's assumed that as long as you repeat and don't repeat, it's the same impact. The effect will only be there if you forget (make a mistake) - it increases card's slope

- Editor: панель редактирования графа (ранее Viewer)
- Feed: лента для повторения карточек
- Plugins: компоненты (в т.ч. ссылки), которые можно добавлять в фид и в рендер карточек