import axios from 'axios';

export async function fetchDataFromExternalEndpoint(vendaID: any): Promise<any> {
    try {
        console.log('fetchDataFromExternalEndpoint: vendaID', vendaID)
        // Substitua a URL abaixo pelo endpoint externo que você deseja acessar
        const response = await axios.get(`http://localhost/decript.php/?saleID=${vendaID}`);
        // O resultado da requisição estará em response.data
        return response.data;
    } catch (error) {
        console.error('Erro na requisição:');
        // console.error('Erro na requisição:', error);
        throw error;
    }
}