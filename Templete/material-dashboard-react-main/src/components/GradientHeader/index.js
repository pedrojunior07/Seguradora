import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function GradientHeader({ title, color }) {
  return (
    <MDBox
      mx={2}
      mt={-3}
      py={3}
      px={2}
      variant="gradient"
      bgColor={color}
      borderRadius="lg"
      coloredShadow={color}
    >
      <MDTypography variant="h6" color="white">
        {title}
      </MDTypography>
    </MDBox>
  );
}

GradientHeader.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
};

GradientHeader.defaultProps = {
  color: "info",
};
