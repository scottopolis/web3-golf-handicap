import React, { useState } from "react";
import { Box, Input, Button } from "@chakra-ui/react";

export const HandicapForm = (props) => {
  const { onSubmit, loading } = props;
  const [form, setForm] = useState({});
  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    let newForm = {...form}
    newForm[name] = value;
    setForm(newForm);
  };

  return (
    <Box width="100%" maxW="500px" overflow="hidden" margin="10px auto">
      <Box mb={2}>
        <Box as="label">Course</Box>
        <Input name="course" type="text" onChange={handleInputChange} />
      </Box>
      <Box mb={2}>
        <Box as="label">Score</Box>
        <Input name="score" type="number" onChange={handleInputChange} />
      </Box>
      <Box mb={2}>
        <Box as="label">Date Played</Box>
        <Input name="date" type="date" onChange={handleInputChange} />
      </Box>
      <Box mb={2}>
        <Box as="label">Slope</Box>
        <Input name="slope" type="number" onChange={handleInputChange} />
      </Box>
      <Box mb={2}>
        <Box as="label">Rating</Box>
        <Input name="rating" type="number" onChange={handleInputChange} />
      </Box>
      <Button
        onClick={() => onSubmit(form)}
        colorScheme="blue"
        width="100%"
        mt={3}
        isLoading={loading}
        loadingText="Submitting"
      >
        Submit
      </Button>
    </Box>
  );
};
