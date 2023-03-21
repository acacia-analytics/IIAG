function populateRightNav(subnavName) {

    const navParent = document.getElementById('right-nav');

    navParent.innerHTML = '';

    for (i = 0; i < rightNavMenuData[subnavName].length; i++) {
        const childItem = document.createElement('a');
        childItem.href = rightNavMenuData[subnavName][i]['link']
        childItem.innerHTML = rightNavMenuData[subnavName][i]['inner']
        navParent.appendChild(childItem)
    };
};

function populateLeftNav() {
	const navParent = document.getElementById('left-nav');

	navParent.innerHTML = '';

	for (i = 0; i < leftNavMenuData.length; i++) {
        const childItem = document.createElement('a');
        childItem.href = leftNavMenuData[i]['link'];
        childItem.innerHTML = leftNavMenuData[i]['inner'];
        if (leftNavMenuData[i]['click'] != null) {
        	childItem.setAttribute("onclick", leftNavMenuData[i]['click']);
        };
        navParent.appendChild(childItem);
    };
}

function openNav() {
    document.getElementById("main-nav").style.width = "100%";
    populateLeftNav();
};

function closeNav() {
    document.getElementById("main-nav").style.width = "0%";

    const navParent = document.getElementById('right-nav');

    navParent.innerHTML = '';
};

	