const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
