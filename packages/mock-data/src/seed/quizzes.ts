import type { Question, Quiz, QuizTheme } from '@wakasafe/domain';

import type { Timeline } from './timeline';

// CONTENU PROVISOIRE, À REMPLACER PAR LE CONTENU GOSAFE.
// Generic road-safety questions written for the demo; they must be reviewed and replaced
// by GOSAFE before any public use (isPlaceholderContent: true).

interface QuestionSpec {
  statement: string;
  /** The first choice is the correct one; positions are shuffled deterministically below. */
  choices: [string, string, string, string];
  explanation: string;
}

interface QuizSpec {
  id: string;
  title: string;
  theme: QuizTheme;
  questions: QuestionSpec[];
}

const QUIZZES: QuizSpec[] = [
  {
    id: 'quiz-traffic-code',
    title: 'Code de la route : les bases',
    theme: 'TRAFFIC_CODE',
    questions: [
      {
        statement: 'À un carrefour sans signalisation, à qui devez-vous céder le passage ?',
        choices: [
          'Aux véhicules venant de droite',
          'Aux véhicules venant de gauche',
          'Au véhicule le plus gros',
          'À personne si la voie est large',
        ],
        explanation:
          'Sans panneau ni feu, la règle de la priorité à droite s’applique : on cède le passage aux véhicules qui arrivent par la droite.',
      },
      {
        statement: 'Que signifie un feu orange fixe ?',
        choices: [
          'S’arrêter, sauf si l’arrêt est dangereux',
          'Accélérer pour passer avant le rouge',
          'Le passage est libre',
          'Seuls les piétons peuvent passer',
        ],
        explanation:
          'Le feu orange annonce le rouge : il impose l’arrêt, sauf si le véhicule est trop près pour s’arrêter en sécurité.',
      },
      {
        statement: 'Qui doit porter la ceinture de sécurité dans une voiture ?',
        choices: [
          'Le conducteur et tous les passagers',
          'Seulement le conducteur',
          'Seulement les passagers à l’avant',
          'Personne en ville',
        ],
        explanation:
          'La ceinture protège chaque occupant. En cas de choc, un passager non attaché peut aussi blesser les autres.',
      },
      {
        statement: 'Un piéton s’engage sur un passage pour piétons. Que faites-vous ?',
        choices: [
          'Je ralentis et je le laisse traverser',
          'Je klaxonne pour qu’il recule',
          'J’accélère pour passer avant lui',
          'Je le contourne sans ralentir',
        ],
        explanation:
          'Le piéton engagé sur un passage est prioritaire. Ralentir à l’approche permet de s’arrêter à temps.',
      },
      {
        statement: 'Un panneau triangulaire bordé de rouge indique :',
        choices: ['Un danger', 'Une obligation', 'Une interdiction', 'Une direction'],
        explanation:
          'Les panneaux triangulaires à bord rouge sont des panneaux de danger : ils annoncent un risque à venir.',
      },
    ],
  },
  {
    id: 'quiz-good-reflexes',
    title: 'Les bons réflexes au quotidien',
    theme: 'GOOD_REFLEXES',
    questions: [
      {
        statement: 'Une forte pluie commence. Quel est le bon réflexe ?',
        choices: [
          'Réduire sa vitesse et augmenter la distance de sécurité',
          'Garder la même vitesse',
          'Allumer les feux de détresse et continuer vite',
          'Suivre de près le véhicule de devant',
        ],
        explanation:
          'Sur route mouillée, la distance de freinage augmente fortement. Rouler moins vite et plus loin des autres laisse le temps de réagir.',
      },
      {
        statement: 'Vous voyez un nid-de-poule dangereux sur votre trajet. Que faites-vous ?',
        choices: [
          'Je ralentis, je l’évite sans geste brusque, puis je le signale une fois arrêté',
          'Je le signale sur mon téléphone en roulant',
          'Je donne un coup de volant au dernier moment',
          'Je l’ignore',
        ],
        explanation:
          'La sécurité passe d’abord par la conduite. Le signalement se fait à l’arrêt, en lieu sûr, ou par un passager.',
      },
      {
        statement: 'Avant de monter sur une moto-taxi, le bon réflexe est :',
        choices: [
          'Porter un casque et vérifier que le conducteur en porte un',
          'Monter à trois pour payer moins cher',
          'S’asseoir en amazone',
          'Demander au conducteur d’aller plus vite',
        ],
        explanation:
          'Le casque réduit fortement le risque de blessure grave à la tête. Un seul passager, bien assis, garde la moto stable.',
      },
      {
        statement: 'Téléphoner en tenant son téléphone en main pendant la conduite :',
        choices: [
          'Est dangereux et interdit : il faut s’arrêter dans un endroit sûr',
          'Est permis à faible vitesse',
          'Est permis la nuit',
          'Est permis si l’appel est court',
        ],
        explanation:
          'Tenir son téléphone détourne les yeux, les mains et l’attention de la route. Pour appeler, on s’arrête en lieu sûr.',
      },
      {
        statement: 'La nuit, comment un piéton peut-il être mieux vu ?',
        choices: [
          'En portant des vêtements clairs ou réfléchissants',
          'En marchant au milieu de la chaussée',
          'En portant des vêtements sombres',
          'En traversant en courant',
        ],
        explanation:
          'Les vêtements clairs ou réfléchissants rendent le piéton visible de beaucoup plus loin dans la lumière des phares.',
      },
    ],
  },
  {
    id: 'quiz-first-aid',
    title: 'Premiers secours sur la route',
    theme: 'FIRST_AID',
    questions: [
      {
        statement: 'Vous arrivez le premier sur un accident. Que faites-vous d’abord ?',
        choices: [
          'Je protège les lieux pour éviter un suraccident',
          'Je déplace immédiatement les blessés',
          'Je prends des photos',
          'Je repars chercher de l’aide sans rien signaler',
        ],
        explanation:
          'Protéger d’abord : baliser et sécuriser la zone évite qu’un autre véhicule ne provoque un nouvel accident.',
      },
      {
        statement: 'Quel est l’ordre des gestes de base face à un accident ?',
        choices: [
          'Protéger, alerter, secourir',
          'Secourir, protéger, alerter',
          'Alerter, secourir, protéger',
          'Secourir, alerter, protéger',
        ],
        explanation:
          'Protéger, alerter, secourir : cet ordre évite de nouvelles victimes et fait venir les secours au plus vite.',
      },
      {
        statement: 'Faut-il retirer le casque d’un motocycliste blessé et inconscient ?',
        choices: [
          'Non, sauf nécessité vitale et par une personne formée',
          'Oui, toujours et tout de suite',
          'Oui, pour lui donner à boire',
          'Oui, pour le reconnaître',
        ],
        explanation:
          'Retirer le casque peut aggraver une blessure du cou. Seule une personne formée le fait, et seulement si la vie est en jeu.',
      },
      {
        statement: 'Une victime saigne abondamment du bras. Que faites-vous ?',
        choices: [
          'J’appuie fortement sur la plaie avec un tissu propre',
          'Je laisse saigner pour nettoyer la plaie',
          'Je lui donne à boire',
          'Je la fais marcher',
        ],
        explanation:
          'Une compression directe et ferme sur la plaie est le geste le plus efficace pour arrêter un saignement important.',
      },
      {
        statement: 'Quand vous alertez les secours, que devez-vous indiquer ?',
        choices: [
          'Le lieu précis, ce qui s’est passé et le nombre de victimes',
          'Uniquement votre nom',
          'Uniquement la marque des véhicules',
          'Rien, ils trouveront seuls',
        ],
        explanation:
          'Un lieu précis et un bilan rapide permettent aux secours d’envoyer les bons moyens au bon endroit.',
      },
    ],
  },
  {
    id: 'quiz-specific-dangers',
    title: 'Dangers spécifiques de nos routes',
    theme: 'SPECIFIC_DANGERS',
    questions: [
      {
        statement:
          'Après la pluie, une route en terre devient glissante. Quel est le risque principal ?',
        choices: [
          'La perte d’adhérence et le dérapage',
          'Une panne de moteur',
          'Une crevaison certaine',
          'Aucun risque particulier',
        ],
        explanation:
          'La boue réduit fortement l’adhérence des pneus. Il faut ralentir et éviter les freinages et coups de volant brusques.',
      },
      {
        statement: 'Vous approchez d’une zone d’éboulement signalée. Que faites-vous ?',
        choices: [
          'Je ralentis, je reste attentif et je ne m’arrête pas sous la zone instable',
          'Je m’arrête sous la paroi pour observer',
          'J’accélère fortement',
          'Je fais demi-tour sur place sans regarder',
        ],
        explanation:
          'Des pierres peuvent encore tomber. On traverse prudemment sans stationner sous la zone instable.',
      },
      {
        statement: 'Un pont paraît endommagé. Quelle attitude adopter ?',
        choices: [
          'Ne pas s’y engager et signaler le danger',
          'Passer vite pour limiter le temps sur le pont',
          'Passer en surchargeant le véhicule',
          'Attendre qu’un autre véhicule teste le pont',
        ],
        explanation:
          'Un pont abîmé peut céder. On ne s’y engage pas et on signale le danger pour protéger les autres usagers.',
      },
      {
        statement: 'De nuit, des travaux sont mal balisés. Quel est le bon réflexe ?',
        choices: [
          'Réduire fortement sa vitesse et redoubler d’attention',
          'Garder sa vitesse',
          'Éteindre ses phares',
          'Doubler les véhicules qui ralentissent',
        ],
        explanation:
          'Sans balisage, les obstacles apparaissent tard. Une vitesse réduite laisse le temps de les voir et de les éviter.',
      },
      {
        statement:
          'Une rue est inondée et vous ne voyez pas la profondeur de l’eau. Que faites-vous ?',
        choices: [
          'Je ne traverse pas et je cherche un autre itinéraire',
          'Je traverse rapidement',
          'Je suis le véhicule devant moi',
          'Je traverse à pied',
        ],
        explanation:
          'Quelques dizaines de centimètres d’eau en mouvement suffisent à emporter une personne ou un véhicule. On fait demi-tour.',
      },
    ],
  },
];

/** Deterministic rotation so the correct answer is not always the first choice. */
function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = by % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

export function seedQuizzes(t: Timeline): { quizzes: Quiz[]; questions: Question[] } {
  const quizzes: Quiz[] = [];
  const questions: Question[] = [];
  QUIZZES.forEach((quiz, quizIndex) => {
    quizzes.push({
      id: quiz.id,
      title: quiz.title,
      theme: quiz.theme,
      isActive: true,
      isPlaceholderContent: true,
      createdAt: t.daysAgo(100 - quizIndex),
    });
    quiz.questions.forEach((question, questionIndex) => {
      const questionId = `${quiz.id}-q${questionIndex + 1}`;
      const labelled = question.choices.map((label, choiceIndex) => ({
        id: `${questionId}-c${choiceIndex + 1}`,
        label,
      }));
      const ordered = rotate(labelled, quizIndex + questionIndex);
      questions.push({
        id: questionId,
        quizId: quiz.id,
        statement: question.statement,
        choices: ordered.map((choice, position) => ({ ...choice, position })),
        correctChoiceId: `${questionId}-c1`,
        explanation: question.explanation,
        position: questionIndex,
      });
    });
  });
  return { quizzes, questions };
}
