# Gameday Rivals

*A game-theory simulation built around promotions, rivalry, and repeated competition.*

Use a six-game football season to connect students’ promotion choices to individual incentives, joint profit, and expectations about a familiar competitor. The formal payoff matrix appears after they have played.

## Why This Game Exists

This one came together fairly easily because I knew I wanted to do game theory, but I needed a good backdrop. I was building the game during college football season, so the setting came pretty quickly. The next question was what kind of businesses should compete on those weekends. I settled on gig-economy delivery services because students already understand food delivery, competing apps, discounts, and trying to capture more orders when town is busy.

Then I had to decide how much game theory to include. Dominant strategies, Prisoner’s Dilemma, and Nash equilibrium appear in most principles textbooks. I was less sure about repeated games. The football schedule gave me a way into that idea: each home game stands on its own, but the same two firms meet again on another weekend. The crowd changes, and the firms have a history together. Students might not call that a repeated game yet, but they understand another home game, the same competitor, and another decision. I wanted the terminology to follow an experience they could already explain.

## What Students Do

Students manage Copper Cart against Clover Run in Alderwick over six home football weekends: Big Home Opener, Small-Team Game, Conference Game, Heated Rival, Homecoming, and Biggest Rival. They choose Standard Promotion or Aggressive Promotion each time. Standard keeps normal offers; Aggressive pushes a major discount to attract orders. The market opportunity changes with the weekend.

Clover Run’s offer is committed before the strategy buttons appear, and students cannot see it before choosing. Both decisions are revealed together. The rival uses completed history and the current weekend’s context; it cannot react to the student’s current button press. Each round therefore presents simultaneous, independent choices with uncertainty about the other firm’s offer.

The reveal reports both promotions, each firm’s game-day profit, delivery activity, game-day order share, and season market share. The Season desk tracks cumulative profit and share, while Season history records the completed weekends. After Game 6, “Review the season” opens the classification, totals, payoff matrix, economic explanation, and a new application. A particular season may contain only some of the four possible action pairs; the matrix shows the full set.

When browser storage is available, completed reveals are saved. Returning students can resume at the next unresolved game or review a completed season. New Season clears this game’s history after confirmation; Play Another Season begins a fresh run from the debrief. The application’s progress resets when the debrief is reopened, while the saved season remains available.

## What the Game Is Really Teaching

Early in the season, students are deciding whether a discount will bring enough orders to justify its cost. What Clover Run does matters. An aggressive offer against normal offers brings Copper Cart the larger share and profit. When both firms discount heavily, delivery activity is high but each pays for the promotion, leaving lower profits than when both keep normal offers. Students encounter this tension before the game names it.

The final matrix makes the one-weekend comparison explicit. Each cell below gives Copper Cart’s profit first and Clover Run’s second, before the game-day demand multiplier.

| Copper Cart’s promotion | Clover Run Standard | Clover Run Aggressive |
|---|---|---|
| Standard | $100,000 / $100,000 | $45,000 / $155,000 |
| Aggressive | $155,000 / $45,000 | $70,000 / $70,000 |

Against Standard, Copper Cart earns $155,000 by choosing Aggressive rather than $100,000 with Standard. Against Aggressive, it earns $70,000 rather than $45,000. Aggressive pays more in either comparison, making it the one-shot dominant strategy. Clover Run faces the same incentives. Dominance compares a firm’s alternatives while holding the rival’s action fixed; it does not promise the highest payoff anywhere in the matrix.

At Aggressive/Aggressive, switching alone to Standard would reduce either firm’s profit from $70,000 to $45,000. Neither gains from that unilateral change, so mutual Aggressive is the one-shot Nash equilibrium. Yet both firms would earn $100,000 under mutual Standard. The individually attractive choices produce $140,000 in combined base profit rather than $200,000. That conflict between individual incentives and the joint result is the Prisoner’s Dilemma.

The football schedule changes the stakes of this comparison. Both payoffs receive the same positive market multiplier, from 0.80 for Small-Team Game to 1.50 for Biggest Rival. The ordering remains 155 > 100 > 70 > 45 in thousands before scaling, or T > R > P > S: temptation, reward, punishment, and sucker payoff. A bigger crowd makes winning or losing more consequential without changing which promotion pays more against a given rival action.

The season then adds history. Earlier Copper Cart aggression makes later Clover Run aggression more likely; repeated restraint can make later restraint more likely. Those responses remain uncertain. Students develop expectations from completed rounds, but an aggressive move following earlier aggression is only consistent with retaliation, not proof of motive. Repetition does not guarantee cooperation, and mutual Standard should not be presented as the equilibrium of the six-game season. Game 6 also has no later home game in which either firm can respond.

Profit and order share answer different questions. The game-day split is 50/50 when both choose the same promotion and 62/38 in favor of the sole aggressive firm when their choices differ. Mutual Standard and mutual Aggressive therefore produce the same order split but different profits. Season share weights each weekend’s order split by market size: winning the larger share on Biggest Rival matters more than the same win on Small-Team Game. The number of weekends won alone cannot determine season share.

The firms, markets, payoffs, and rival behavior are fictional instructional constructs. They illustrate strategic incentives and repeated interaction, rather than estimate actual delivery-market profits, market shares, or competitor behavior.

## Reading the Football Weekends

Each of the six weekends has its own Alderwick scene. Crowds and traffic communicate the scale and atmosphere of the market, with Biggest Rival taking place under stadium lights at night. These scenes establish the setting; exact payoffs and shares come from the interface. Students should use the displayed figures rather than count people or vehicles.

After each reveal, a separate Delivery activity display labels Standard as Moderate and Aggressive as High for each firm. High/High can accompany lower joint profit because both platforms pay for discounts. Activity is distinct from order share: two highly active firms still split the game’s orders equally when both choose Aggressive.

## The Educational Loop

Students choose promotions, see both firms’ results, and use the explanations and season ledger to interpret what happened. The final debrief formalizes those experiences through the matrix, dominant strategy, Nash equilibrium, and repeated interaction. The attached application changes the payoffs and asks them to reason again.

**Experience → Consequence → Economic Explanation → Formalization → Transfer**

The season classification summarizes observed play: Promotion War, Retaliation Cycle, Opportunistic Season, Stable Competition, Market-Share Chase, or Uneasy Restraint. These are descriptive patterns. Ask students to support their classification with the history and distinguish what the record establishes from what they infer about the rival.

## Bringing in the Payoff Matrix

Let students finish the season before introducing the matrix. Begin with an outcome they actually encountered, then locate that action pair in the debrief. Compare Copper Cart’s two payoffs within each rival column. Once students see the individual incentive, ask why both firms following it can leave them worse off than mutual Standard. The one-shot analysis applies to each weekend; completed history links those weekends into repeated interaction.

The debrief also compares actual industry profit with $1,410,000 if both firms independently chose Standard on every weekend. Demand is held fixed. This is a counterfactual comparison, not a recommendation to communicate or coordinate; the game contains no negotiations or agreements. Asymmetric rounds also produce $200,000 in combined base profit, so mutual Standard is not the only action pair with that joint total. The shortfall from the benchmark comes from mutual-Aggressive rounds. The comparison does not predict how Clover Run would respond to a changed player history.

“A different promotion game” then introduces a new delivery market where matching an aggressive promotion costs more. The hypothetical payoffs replace the season’s matrix for this task only. Against Standard, Aggressive earns $140 rather than $120; against Aggressive, Standard earns $50 rather than $40. Students identify those best responses in one application. Neither offer is dominant in this new market, and mutual Aggressive is no longer a Nash equilibrium.

Incorrect answers provide feedback and allow another attempt. A correct answer explains the changed incentives and opens “Finish application.” Completion leaves the original season intact. This follow-up asks students to read the new payoffs instead of carrying “always choose Aggressive” into every strategic setting.

## Using It in Class

### Before formal game theory

Let students play without the matrix. Ask which promotion felt safer and how their expectations about Clover Run changed, then introduce the formal comparisons.

### Dominant strategies and Nash equilibrium

Compare Copper Cart’s alternatives within each rival column. At mutual Aggressive, ask whether switching alone helps either firm, then compare joint profit with mutual Standard.

### Repeated games

Ask which earlier choices influenced a later decision and how students would approach Game 6 if it were their only game. Distinguish observed patterns from inferred intentions.

### Market size and replay

Compare Small-Team Game with Biggest Rival: the ranking stays fixed, but dollar stakes and season-share weights change. On replay, compare choices, rival history, profit, and share. Rival uncertainty can change results even with the same player strategy; look for explanations rather than a winning sequence.

### Independent student review

For independent review, request a reflection connecting an observed outcome to the matrix and explaining the application’s changed best response. Collect it through your course; the game sends no automatic faculty report.

## Questions to Consider

1. Which promotion felt safer before the matrix appeared? Did Clover Run’s earlier choices change that view?
2. Which promotion earns more against Standard? Against Aggressive? What do those comparisons establish?
3. Why is mutual Aggressive a Nash equilibrium when both firms earn more under mutual Standard?
4. Which sequence looked consistent with retaliation? What can it establish about motive?
5. Why does winning 62% of orders on Biggest Rival affect season share more than on Small-Team Game?
6. How can the same order split yield different profits? Consider promotions and market size.
7. What does the mutual-Standard benchmark hold fixed? Why can’t it predict the rival’s replay choices?
8. Why is Aggressive no longer dominant in the new promotion market? Which payoff comparison changes?

## Common Misconceptions

- “The higher joint payoff must be the Nash equilibrium.” At mutual Standard, either firm gains by switching alone. Mutual Aggressive is the one-shot equilibrium.
- “Dominance guarantees the highest possible payoff.” It identifies the better response to each fixed rival action; that rival action still matters.
- “More activity means more profit or share.” High/High activity can accompany equal shares and lower joint profit after discounts.
- “The rival sees my current choice.” Its offer is committed beforehand, using completed history and the weekend’s context.
- “Repetition guarantees cooperation or proves retaliation.” History changes probabilities; choices remain uncertain, and a sequence does not prove motive.
