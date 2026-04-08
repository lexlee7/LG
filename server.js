const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

const gamesData = {
    'oxygen-zero': [
        {
            description: "Le recycleur de CO2 émet un bruit de porcelaine brisée. Une vapeur épaisse et froide commence à ramper sur le sol de la cabine. L'IA du bord, d'une voix dépourvue d'émotion, suggère que la fin est proche si vous ne sacrifiez pas le chauffage des quartiers de vie.",
            options: [
                { 
                    text: "Couper le chauffage et s'envelopper dans les couvertures de survie.", 
                    outcome: "Le froid s'installe, vicieux et immédiat. Vos articulations se figent et chaque mouvement devient une torture, mais l'air redevient respirable. Le givre dessine des paysages fantomatiques sur les écrans de contrôle. Vous avez gagné du temps, au prix de votre confort thermique.",
                    o2: +25, integrity: -5 
                },
                { 
                    text: "Tenter une dérivation électrique risquée à travers les systèmes de coque.", 
                    outcome: "Des étincelles dansent comme des lucioles enragées dans la coursive. Le chauffage tient, mais la structure a encaissé une décharge massive. Un gémissement métallique vous avertit que la coque est désormais plus fragile que jamais. La chaleur est là, mais la sécurité s'est envolée.",
                    o2: +10, integrity: -20 
                }
            ]
        },
        {
            description: "Une ombre immense glisse sur les panneaux solaires, plongeant la station dans une obscurité soudaine. Ce n'est pas une éclipse, c'est une tempête de poussière électrostatique. Les décharges crépitent sur le verre de votre hublot, une musique sauvage et destructrice.",
            options: [
                { 
                    text: "Sortir en urgence pour arrimer les boucliers de protection.", 
                    outcome: "Le vent vous projette contre la paroi avec une violence inouïe. Le choc est brutal, votre combinaison est entamée, mais les boucliers sont en place. Vous rentrez en titubant, le goût du sang dans la bouche, mais la station a tenu bon face à l'assaut.",
                    o2: -15, integrity: +20 
                },
                { 
                    text: "Rester à l'intérieur et prier pour que le polycarbonate tienne.", 
                    outcome: "Vous restez prostré, écoutant le sable martien décaper votre foyer avec la fureur d'une sableuse industrielle. Le verre se raye, devient opaque, s'amincit. La tempête finit par passer, vous laissant dans une structure ébranlée, le moral en lambeaux.",
                    o2: 0, integrity: -25 
                }
            ]
        }
    ]
};

io.on('connection', (socket) => {
    socket.on('v4_get_event', (payload) => {
        const events = gamesData['oxygen-zero'];
        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        
        if (payload.lastAction) {
            // On trouve l'outcome correspondant à l'action envoyée
            let finalOutcome = "Les répercussions de votre choix se font sentir...";
            for(let e of events) {
                let match = e.options.find(o => o.text === payload.lastAction);
                if(match) finalOutcome = match.outcome;
            }
            
            socket.emit('v4_event_outcome', { 
                outcome: finalOutcome, 
                nextEvent: selectedEvent 
            });
        } else {
            socket.emit('v4_event_data', selectedEvent);
        }
    });
});

server.listen(process.env.PORT || 3000);
