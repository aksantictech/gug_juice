# GUG — Commande en ligne

Mini-site statique, responsive et prêt pour Vercel.

## Tester en local

### Option simple
Dans le dossier du projet :

```bash
python -m http.server 8080
```

Puis ouvrir : http://localhost:8080

### Avec VS Code
Utiliser l'extension Live Server sur `index.html`.

## Déployer sur Vercel

1. Créer un dépôt GitHub et y envoyer les fichiers du dossier.
2. Dans Vercel : **Add New > Project**.
3. Importer le dépôt.
4. Framework Preset : **Other**.
5. Build Command : laisser vide.
6. Output Directory : laisser vide.
7. Cliquer **Deploy**.

Vous pouvez aussi déployer avec Vercel CLI depuis ce dossier.

## À personnaliser

- Numéro WhatsApp : actuellement `+32 470 92 31 14` dans `index.html` et `app.js`.
- Prix : dans `app.js` (objets PRODUCTS) et dans `index.html` pour l'affichage.
- Adresse/retrait : texte `Liedekerke`.
- Photos : dossier `assets/`.

## Fonctionnement

- Sélection de formats 1 L / 500 ml / 250 ml.
- Calcul automatique du panier.
- Formulaire livraison ou retrait.
- Génération d'un numéro de commande.
- Envoi de la commande préremplie vers WhatsApp.
- Aucun backend et aucun paiement en ligne dans cette V1.
