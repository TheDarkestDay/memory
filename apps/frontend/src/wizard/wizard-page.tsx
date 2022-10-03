export const WizardPage = () => {
  return (
    <main>
      <h1>
        memory
      </h1>

      <form>
        <fieldset>
          <legend>
            Select Theme
          </legend>

          <div>
            <label htmlFor="theme-numbers">
              Numbers
            </label>
            <input id="theme-numbers" type="radio" name="theme" value="numbers" />
          </div>

          <div>
            <label htmlFor="theme-emojis">
              Emojis
            </label>
            <input id="theme-emojis" type="radio" name="theme" value="emojis" />
          </div>
        </fieldset>

        <fieldset>
          <legend>
            Number of Players
          </legend>

          <div>
            <label htmlFor="players-one">
              1
            </label>
            <input id="players-one" type="radio" name="players" value="1" />
          </div>

          <div>
            <label htmlFor="players-two">
              2
            </label>
            <input id="players-two" type="radio" name="players" value="2" />
          </div>

          <div>
            <label htmlFor="players-three">
              3
            </label>
            <input id="players-three" type="radio" name="players" value="3" />
          </div>

          <div>
            <label htmlFor="players-four">
              4
            </label>
            <input id="players-four" type="radio" name="players" value="4" />
          </div>
        </fieldset>

        <fieldset>
          <legend>
            Grid Size
          </legend>

          <div>
            <label htmlFor="size-small">
              4x4
            </label>
            <input id="size-small" type="radio" name="size" value="4" />
          </div>

          <div>
            <label htmlFor="size-medium">
              6x6
            </label>
            <input id="size-medium" type="radio" name="size" value="6" />
          </div>
        </fieldset>

        <button type="submit">
          Create Game
        </button>
      </form>
    </main>
  );
};
