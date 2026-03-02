const fs = require('fs');
const path = require('path');

const modulesDir = 'c:/Users/soumy/OneDrive/Desktop/saas/backend/src/modules';
const dirs = fs.readdirSync(modulesDir);

dirs.forEach(dir => {
    if (dir === 'auth' || dir === 'super-admin') return;

    let file;
    // Special case for employees vs employee
    if (dir === 'employees') {
        file = path.join(modulesDir, dir, 'employee.routes.js');
    } else if (dir === 'activities') {
        file = path.join(modulesDir, dir, 'activity.routes.js');
    } else {
        // try plural to singular
        const singular = dir.endsWith('s') ? dir.slice(0, -1) : dir;
        file = path.join(modulesDir, dir, `${singular}.routes.js`);
        if (!fs.existsSync(file)) {
            file = path.join(modulesDir, dir, `${dir}.routes.js`);
        }
    }

    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Add planGuard import
        if (!content.includes('planGuard.middleware')) {
            content = content.replace(
                "const { protect, authorize } = require('../../middlewares/auth.middleware');",
                "const { protect, authorize } = require('../../middlewares/auth.middleware');\nconst { planGuard } = require('../../middlewares/planGuard.middleware');"
            );

            // if it was just protect
            content = content.replace(
                "const { protect } = require('../../middlewares/auth.middleware');",
                "const { protect } = require('../../middlewares/auth.middleware');\nconst { planGuard } = require('../../middlewares/planGuard.middleware');"
            );
            modified = true;
        }

        // Add planGuard usage
        if (!content.includes('router.use(protect, planGuard);')) {
            content = content.replace("router.use(protect);", "router.use(protect, planGuard);");
            modified = true;
        }

        // Also fix any 'Admin' or 'Sales' occurrences to 'admin', 'sales', 'field_agent'
        const orig = content;
        content = content.replace(/authorize\('Admin'\)/g, "authorize('admin')");
        content = content.replace(/authorize\('Sales'\)/g, "authorize('sales')");
        content = content.replace(/authorize\('Field'\)/g, "authorize('field_agent')");

        if (orig !== content) modified = true;

        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    } else {
        console.log(`Could not find route file for module ${dir}`);
    }
});
