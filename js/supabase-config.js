// ====================================================================
// SUPABASE CLIENT CONFIGURATION
// ====================================================================
const SUPABASE_URL = "https://xlvnbbvqqzlldjcgkphg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6Rmmu7KfklSHfrRC2jsclA_DcFWrYPF";

let supabaseClient = null;
const isSupabaseConfigured = () => {
    return SUPABASE_URL && 
           !SUPABASE_URL.includes("your-project-id") && 
           SUPABASE_ANON_KEY && 
           !SUPABASE_ANON_KEY.includes("your-anon-key");
};

if (typeof window.supabase !== 'undefined' && isSupabaseConfigured()) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("⚡ Supabase connected successfully.");
    } catch (e) {
        console.warn("Supabase init error:", e);
    }
}

// Optional EmailJS Direct Email Dispatch Configuration
// If you want custom emails sent via your Gmail via EmailJS (100% free),
// add your Public Key, Service ID and Template ID below.
window.EMAILJS_CONFIG = {
    publicKey: "", // e.g. "user_xxxxxxxxxxxx"
    serviceId: "", // e.g. "service_xxxxxxx"
    templateId: ""  // e.g. "template_xxxxxxx"
};

// Production Fallback Cache for 0ms instantaneous paint (Fastest of the Fastest)
const FALLBACK_PROJECTS = [
    {
        id: "77913ed5-6cb4-4785-a760-b475a7f6ba14",
        title: "ALTAMAAS WEBSITE",
        category: "Web App",
        description: "Official live production website for Altamaas offering seamless product browsing, catalog showcase, and rapid load speeds.",
        price: "15000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1788868265/e4uxkrcprwf4g4wyfzub.jpg",
        playstore_url: "",
        live_url: "https://altamaaspk.com",
        github_url: "",
        badge: "E-Commerce Website",
        tech_stack: ["Web Development", "E-Commerce", "Responsive UI"],
        stats: "Live Production",
        is_featured: true
    },
    {
        id: "bf7316f9-9f67-4a7d-b1e7-d068e82fd51d",
        title: "Bayt Al-Nu'as for Curtains & Majlis Furnishings",
        category: "Web App",
        description: "Official enterprise e-commerce platform for Bayt Al-Nu'as Curtains & Majlis Furnishings with catalog management and responsive design.",
        price: "15000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1788868232/hs0qotihjgtf9r57fsgk.jpg",
        playstore_url: "",
        live_url: "https://baytulnuas.com",
        github_url: "",
        badge: "Brand E-Commerce",
        tech_stack: ["E-Commerce", "Brand Website", "Furnishings"],
        stats: "Commercial Client",
        is_featured: true
    },
    {
        id: "c331f3d6-8296-42e8-a8d5-49f83a750e08",
        title: "Leave Management System (Leave MS)",
        category: "Full Stack",
        description: "Comprehensive enterprise leave management system with employee portals, approval workflows, department tracking, and audit logs.",
        price: "25000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1788868665/ezdjbrdqzykrttt9qg17.jpg",
        playstore_url: "",
        live_url: "https://github.com/Abbasi333/Leave_Management_System",
        github_url: "https://github.com/Abbasi333/Leave_Management_System",
        badge: "Enterprise System",
        tech_stack: ["Full-Stack", "PHP", "MySQL", "Auth & Roles"],
        stats: "Enterprise Grade",
        is_featured: true
    },
    {
        id: "05e663e5-9255-4783-b1e2-53edd1c22250",
        title: "Educational Website (LearnSpheres)",
        category: "Web App",
        description: "Modern educational platform offering online learning modules, student dashboards, and responsive interactive design.",
        price: "13000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1788868458/iygrkerxi0tmqvw4wuzw.jpg",
        playstore_url: "",
        live_url: "https://learnspheres.netlify.app/",
        github_url: "",
        badge: "EdTech Portal",
        tech_stack: ["EdTech", "Web Platform", "Frontend", "Interactive"],
        stats: "Live Online",
        is_featured: true
    },
    {
        id: "0c04be4f-5ae8-4a19-9b22-6f36687aa89b",
        title: "ARIDGYM Website",
        category: "Web App",
        description: "Fitness and gym management website featuring membership plans, fitness schedules, and trainer profiles.",
        price: "12000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1777102754/r0sweo0m5isqsnrvy3dg.jpg",
        playstore_url: "",
        live_url: "https://gymarid.netlify.app/",
        github_url: "",
        badge: "Fitness Platform",
        tech_stack: ["Fitness", "Membership System", "Responsive Web"],
        stats: "Semester Capstone",
        is_featured: true
    },
    {
        id: "e30dd250-4199-4319-8440-5a1e58cc6751",
        title: "Guess A Number",
        category: "Web App",
        description: "Fast, lightweight interactive number guessing game with live score tracking and responsive layout.",
        price: "6000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1788868381/b55p7zvw89bd3kgt58cg.jpg",
        playstore_url: "",
        live_url: "https://guessinnumber.netlify.app/",
        github_url: "",
        badge: "Interactive Web Game",
        tech_stack: ["JavaScript", "Logic", "DOM Manipulation", "CSS3"],
        stats: "Interactive Game",
        is_featured: true
    },
    {
        id: "cab8161f-692f-4d7b-8f33-91f31a657d9e",
        title: "Blood Donation App",
        category: "Mobile App",
        description: "Life-saving mobile application connecting blood donors with recipients in urgent need with real-time matching and notification systems.",
        price: "22000 PKR",
        image_url: "https://res.cloudinary.com/ddq4qywrl/image/upload/v1793803568/mf8uxfnc8y5ttxa5irbf.jpg",
        playstore_url: "",
        live_url: "https://github.com/Abbasi333/SemesterProject",
        github_url: "https://github.com/Abbasi333/SemesterProject",
        badge: "Mobile Application",
        tech_stack: ["Android", "Java", "Firebase", "Real-Time GPS"],
        stats: "Active Mobile System",
        is_featured: true
    }
];

const FALLBACK_FEEDBACKS = [
    {
        name: "Hamza Tariq",
        rating: 5,
        text: "Ubaid deployed my app to Google Play Store seamlessly! Clean architecture, zero rejected builds, and super responsive communication."
    },
    {
        name: "Altamaas Store Client",
        rating: 5,
        text: "Exceptional speed and precision. Altamaaspk.com was built cleanly with modern architecture and outstanding responsive design."
    }
];
