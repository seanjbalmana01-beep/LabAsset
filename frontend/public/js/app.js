fetch('/api/assets')
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('asset-list');
        container.innerHTML = '<ul>' + data.map(item => `<li>${item.name} - ${item.category} (${item.status})</li>`).join('') + '</ul>';
    })
    .catch(err => {
        document.getElementById('asset-list').innerText = 'Failed to load assets.';
    });