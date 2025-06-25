export const navigateWithSearch = (path, searchValue) => {
  // Codifica il valore per l'URL
  const encodedSearch = encodeURIComponent(searchValue);
  // Crea l'URL temporaneo
  const tempUrl = `${path}?search=${encodedSearch}`;
  
  // Naviga alla pagina
  window.location.href = tempUrl;
};