export const CHARACTERS = [
    {
        id: "aura",
        name: "Aura",
        ability: "Foresight",
        description: "Deckin üst 3 kartına bak, birini seç."
    },
    {
        id: "lumo",
        name: "Lumo",
        ability: "Amplify",
        description: "Bu tur oynanan skor kartına +10 bonus."
    },
    {
        id: "zest",
        name: "Zest",
        ability: "Chaos Shift",
        description: "Aksiyon kartı bir ek hedefe etki edebilir."
    },
    {
        id: "puls",
        name: "Puls",
        ability: "Precision Swap",
        description: "Elinden bir kartı seç, başka oyuncunun kartı ile gizli değiştir."
    },
    {
        id: "vigo",
        name: "Vigo",
        ability: "Silent Theft",
        description: "Başka oyuncudan rastgele kart çal."
    }
];

export const getCharacterById = (id) => CHARACTERS.find((char) => char.id === id);
