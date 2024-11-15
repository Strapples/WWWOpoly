function setUniqueCookie() {
    if (!document.cookie.includes("user_bonus")) {
        // Generate a unique anonymous ID
        const uniqueID = 'id-' + Math.random().toString(36).substr(2, 9);
        
        // Set the cookie with the unique ID and "yummy chocolate" text, with a 5-day expiration
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 5);
        document.cookie = `user_bonus=${uniqueID}-yummy_chocolate; expires=${expiryDate.toUTCString()}; path=/`;
        
        console.log("First visit cookie set with ID and tag:", `${uniqueID}-yummy_chocolate`);
    } else {
        console.log("Cookie already exists. No new cookie set.");
    }
}

setUniqueCookie();
