{
  "intro": {
    "text": "Le silence est la première chose qui vous frappe, [NAME]. Un silence épais, poisseux, interrompu seulement par le sifflement erratique d'une valve quelque part derrière les cloisons de la navette. \n\nVous ouvrez les yeux. Vos paupières sont lourdes. Une alarme orange baigne le cockpit d'une lueur funèbre. Vous vous rappelez le choc, la secousse violente, puis plus rien. L'écran de contrôle principal affiche un message laconique en rouge : 'COMMUNICATION TERRE : RUPTURE'. \n\nVous êtes seul(e). Votre oxygène affiche 28%. Vous devez agir, et vite.",
    "choices": [
      { "text": "Vérifier l'état du moteur principal", "next": "moteur" },
      { "text": "Tenter de réinitialiser la radio", "next": "radio" }
    ]
  },
  "moteur": {
    "text": "Vous vous glissez avec difficulté vers la section arrière. L'apesanteur rend chaque mouvement incertain. En ouvrant le panneau d'accès, une odeur de brûlé agresse vos narines. Le réacteur n'est plus qu'un amas de métal fondu. \n\nSoudain, un bruit sourd résonne contre la coque. Comme si quelque chose, ou quelqu'un, frappait de l'extérieur...",
    "choices": [
      { "text": "Regarder par le hublot de maintenance", "next": "hublot" },
      { "text": "Saisir la barre de fer de secours et attendre", "next": "combat" }
    ]
  },
  "radio": {
    "text": "Vos doigts tremblent sur les touches du terminal. Vous forcez le redémarrage. Des parasites envahissent les haut-parleurs. '...ici... base... répondez...' \n\nLa voix est hachée, mais humaine. C'est votre seul lien avec la vie. Mais pour stabiliser le signal, vous devez détourner l'énergie du système de survie. Votre réserve d'air tombera instantanément à 5%.",
    "choices": [
      { "text": "Sacrifier l'air pour appeler à l'aide", "next": "sacrifice" },
      { "text": "Abandonner la radio, l'air est plus précieux", "next": "intro" }
    ]
  }
}
