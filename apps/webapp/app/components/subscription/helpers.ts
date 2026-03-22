export const FREE_PLAN = {
  id: "free",
  metadata: {
    show_on_table: true,
  },
  product: {
    name: "Gratis",
    metadata: {
      features: `
				Onbeperkt aantal assets, 
				Chatondersteuning, 
				3 aangepaste velden, 
				Github ondersteuning, 
				TLS (SSL) inbegrepen, 
				Automatische upgrades, 
				Serveronderhoud
			`,
      slogan: "Voor persoonlijk gebruik of hobby.",
    },
  },
  unit_amount: 0,
  currency: "usd",
  recurring: {
    interval: "month",
  },
};
