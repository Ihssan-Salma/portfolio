/** Visual copy is independent from data and can be replaced by a locale bundle. */
export const trafficMessagesFr={
 locale:'fr-FR',demo:'Démo',vehicles:'véhicules',extractVolume:'Véhicules · extrait',
 priorExtract:'Écart à l’extrait N−1',noReference:'Sans référence',
 chartDescription:'Comptages de démonstration',sampleNote:'Journée échantillon · valeurs de démonstration',
 csv:'CSV démo',fictionalSections:'Tronçons fictifs',noPersonalData:'Comptages agrégés · aucune donnée personnelle',
 datesAndRoads:'Dates et codes de route',normalized:'Normalisés',missing:'Observation manquante',
 excluded:'Exclue ≠ zéro',duplicate:'Doublon exact',removed:'Isolé',atypical:'Valeur atypique',review:'À vérifier',
 noCause:'Signalement descriptif · cause inconnue',accepted:'retenues',isolated:'isolées',
 starDescription:'Modèle en étoile : dimensions calendrier, tronçon et lieu liées à la table de faits trafic par des relations un-à-plusieurs',
 calendar:'Calendrier · 1',roadDimension:'Tronçon · 1',trafficFacts:'Faits trafic · n',location:'Lieu · 1',
 grain:'Clés explicites · un comptage par créneau',daxMeasures:'DAX · mesures explicites',
 volume:'Volume de l’extrait',hourComparison:'Comparaison 18 h / 12 h',comparable:'Évolution N−1 sur un périmètre comparable',
 year:'Année',road:'Tronçon',yearLabel:'Année de démonstration',roadLabel:'Tronçon de démonstration',
};
export type TrafficMessages=typeof trafficMessagesFr;
