module.exports = {
	assignRoles: function(gameState) {
	    /**Scenarios
	        -Animal Hospital
	        -Bank Robbers
	        -CIA Headquarters
	        -Diamond Miners
	        -Jungle Safari
	        -Polar Expeditionists
	        -Aristocratic House Party
	        -Forest Hobo Camp
	        -ISIS Camp
	        -Plane Hijackers
	        -Fight Club
	        -Dungeons & Dragons Game
	        -Greek Gods
	        -Buddhist Monks
	        -US Congress
	        -Salem Witch Trials
	        -Roman Crucifixion
	        -Hogwarts Feast
	        -High-Stakes Poker Game
	        -Haunted House
	    **/
	    	var scenarios = {
		        0: {
		            	title: "Animal Hospital",
		            	roles: {
			                0: "Veterinarian",
			                1: "Anesthesiologist",
			                2: "Janitor",
			                3: "Surgeon",
			                4: "Front Desk Secretary",
			                5: "Biologist",
			                6: "Medical Intern",
			                7: "Medical Engineer",
			                8: "Pharmacologist",
			                9: "Nurse"
		            	}
		        },
		        1: {
		        	title: "Bank Robbers",
		        	roles: {
			                0: "Mastermind",
			                1: "Demolitionist",
			                2: "Getaway Driver",
			                3: "Weapon Specialist",
			                4: "Technology Specialist (remote location)",
			                5: "Vault-driller",
			                6: "Early Distraction",
			                7: "Reconnaissance Specialist",
			                8: "Hostage Taker",
			                9: "Money Bagger"
		            	}
		        },
		        2: {
		            	title: "CIA Headquarters",
		            	roles: {
			                0: "System Administrator",
			                1: "Investigator",
			                2: "Director",
			                3: "Assistant Director",
			                4: "Executive Officer",
			                5: "Researcher",
			                6: "Naval Commander",
			                7: "Censorship Specialist",
			                8: "Foreign Relations",
			                9: "Special Operation Officer"
		            	}
		        },
		        3: {
		            	title: "Diamond Miners",
		            	roles: {
			                0: "Mine Administrator",
			                1: "Geologist",
			                2: "Elevator Specialist",
			                3: "Surveyor",
			                4: "Miner",
			                5: "Miner",
			                6: "Miner",
			                7: "Miner",
			                8: "Miner",
			                9: "Miner"
		            	}
		        },
		        4: {
		            	title: "Jungle Safari",
		            	roles: {
			            	0: "Expeditionist",
			                1: "Biologist",
			                2: "Survivalist",
			                3: "Botanist",
			                4: "Hunter",
			                5: "Journalist",
			                6: "Explorer",
			                7: "Translator",
			                8: "Biologist",
			                9: "Photographer"
		            	}
		        },
		        5: {
	        		title: "Polar Expeditionists",
	        		roles: {
		        		0: "Head Researcher",
			                1: "Assistant Researcher",
			                2: "Meteorologist",
			                3: "Surveyor",
			                4: "Biologist",
			                5: "Journalist",
			                6: "Explorer",
			                7: "Researcher",
			                8: "Survivalist",
			                9: "Photographer"
		        	}
		        },
		        6: {
		        	title: "Aristocratic House Party",
		        	roles: {
		        		0: "Governor",
			                1: "Aristocrat",
			                2: "Snob",
			                3: "Entrepreneur",
			                4: "Duke",
			                5: "Duchess",
			                6: "The Monopoly Guy",
			                7: "Overseer",
			                8: "Senator",
			                9: "Baron"
		        	}
		        },
		        7: {
		        	title: "Forest Hobo Camp",
		        	roles: {
		        		0: "Hobo King",
			                1: "Drifter",
			                2: "Beggar",
			                3: "Hippie",
			                4: "Hobo",
			                5: "Drifter",
			                6: "Beggar",
			                7: "Hobo",
			                8: "Hobo",
			                9: "Hobo"
		        	}
		        },
		        8: {
		        	title: "ISIS Camp",
		        	roles: {
		        		0: "Interrogator",
			                1: "Executioner",
			                2: "Captain",
			                3: "Demolitionist",
			                4: "Mercenary",
			                5: "Terrorist",
			                6: "Jihadist",
			                7: "Prisoner of War",
			                8: "Captured Journalist",
			                9: "Soldier"
		        	}
		        },
		        9: {
		        	title: "Art Museum",
		        	roles: {
		        		0: "Art Snob",
			                1: "Artist",
			                2: "Art Admirer",
			                3: "Security Guard",
			                4: "Curator",
			                5: "Art Critic",
			                6: "Art Collector",
			                7: "Tourist",
			                8: "Art Enthusiast",
			                9: "Artist"
		        	}
		        }
	    	}
	    	var slen = Object.keys(scenarios).length;
	    	var lroll = Math.floor(Math.random() * slen);
	    	gameState.scenario = scenarios[lroll].title;
	    	var noRoles = [1,2,3,4,5,6,7,8,9,10];
	    	for(var i = 0; i < 10; i++) {
	    		var pl = noRoles[Math.floor(Math.random() * noRoles.length)];
	    		gameState.roles[pl] = scenarios[lroll].roles[i];
	    		console.log("P" + pl + " assigned " + scenarios[lroll].roles[i]);
	    		noRoles.splice(noRoles.indexOf(pl), 1);
	    	}
	    	return gameState;
	},
	getScenarios: function() {
		var locations = ["Animal Hospital",
				"Bank Robbers",
				"CIA Headquarters",
				"Diamond Miners",
				"Jungle Safari",
				"Polar Expeditionists",
				"Aristocratic House Party",
				"Forest Hobo Camp",
				"ISIS Camp",
				"Art Museum"	];
		return locations;
	}
}