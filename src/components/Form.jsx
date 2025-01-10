// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import BackButton from "./BackButton";
import { useGeolocationPosition } from "../Hooks/useGeolocationPosition";
import Spinner from "./Spinner";
import Message from "../../starter/components/Message";
import Button from "./Button";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const flagemojiToPNG = (flag) => {
  var countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
    .map((char) => String.fromCharCode(char - 127397).toLowerCase())
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

function Form() {
  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");
  const { lat, lng } = useGeolocationPosition();
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState("");

  useEffect(
    function () {
      async function fetchGeolocation() {
        try {
          setIsLoadingGeolocation(true);
          setError("");
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          setCityName(data.city);
          setCountryName(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
          console.log(data);

          if (!data.countryCode) {
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else on the map 😉"
            );
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoadingGeolocation(false);
        }
      }
      fetchGeolocation();
    },
    [lat, lng]
  );

  if (isLoadingGeolocation) return <Spinner />;

  if (error) return <Message message={error} />;

  return (
    <form className={styles.form}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{flagemojiToPNG(emoji)}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton>Back</BackButton>
      </div>
    </form>
  );
}

export default Form;
