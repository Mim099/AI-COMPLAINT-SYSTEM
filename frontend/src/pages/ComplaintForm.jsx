import { useState } from "react";

function ComplaintForm() {
  const [product, setProduct] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!product || !batch || !description) {
      alert("Fill all fields");
      return;
    }

    console.log({
      product,
      batch,
      description,
    });

    alert("Complaint submitted!");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Submit Complaint</h2>

      <input
        placeholder="Product Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Batch Number"
        value={batch}
        onChange={(e) => setBatch(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Describe issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default ComplaintForm;