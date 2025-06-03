import './Banner.css';

export default function Banner() {
  return (
    <div className="banner-container">
      <div className="background-image"></div>
      <div className="overlay"></div>
      <div className="text-container">
        <h1>Taste the tradition</h1>
        <p>Savor authentic Vietnamese flavors</p>
      </div>
    </div>
  );
}