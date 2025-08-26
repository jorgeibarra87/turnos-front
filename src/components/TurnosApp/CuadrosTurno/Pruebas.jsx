import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ConsultaMicroservicio() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Documento de prueba
    const documentoPrueba = "123456789";

    useEffect(() => {
        axios
            .get(`https://api.plataformadinamica.com/persona/${documentoPrueba}`)
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando datos del documento {documentoPrueba}...</p>;
    if (error) return <p>Error al consultar: {error}</p>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">
                Resultado para documento {documentoPrueba}
            </h1>
            <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
